const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models
const User = require("./models/users");
const Message = require("./models/messages");

// Express setup
const app = express();
app.use(express.json());
app.use(cors());

// Set headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Google Auth Verification
const admin = require("firebase-admin");
const serviceAccount = require("./cuvette-task-firebase-adminsdk-ciacj-b48701c1c3.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract the token from 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
    req.user = decoded; // Attach decoded user info to the request
    next(); // Continue to the route handler
  } catch (err) {
    console.error("Token verification failed:", err); // Log the error
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// API routes
app.post("/auth/google", async (req, res) => {
  const { token, userType } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, userType });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { _id: user._id, email, name, userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: "Login successful", user, token: jwtToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Messaging routes
app.post("/message", authenticate, async (req, res) => {
  const { receiverEmail, content } = req.body;

  try {
    const senderEmail = req.user.email;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    if (sender.userType !== "User") {
      return res.status(403).json({ error: "Only users can send messages" });
    }

    if (receiver.userType !== "Company") {
      return res.status(403).json({ error: "User can only send messages to a Company" });
    }

    const message = new Message({
      sender: sender._id,
      receiver: receiver._id,
      content,
      timestamp: new Date(),
    });

    await message.save();

    io.to(receiver._id.toString()).emit("newMessage", message);

    res.status(200).json({ message: "Message sent successfully", message });
  } catch (err) {
    res.status(500).json({ error: "Error sending message", err });
  }
});

app.get("/messages/company", authenticate, async (req, res) => {
  try {
    if (req.user.userType !== "Company") {
      return res.status(403).json({ error: "Only companies can access this route" });
    }

    const companyId = req.user._id;

    const messages = await Message.find({ receiver: companyId }).populate('sender receiver');

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages", err });
  }
});

// Route to get old chats between a user and a specific company
app.get("/messages/history", authenticate, async (req, res) => {
  const { companyEmail } = req.query; // Use query parameters for company email

  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });
    const company = await User.findOne({ email: companyEmail });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!company || company.userType !== "User") {
      return res.status(404).json({ error: "Company not found or invalid userType" });
    }

    // Fetch the chat history between the user and company
    const messages = await Message.find({
      $or: [
        { sender: user._id, receiver: company._id },
        { sender: company._id, receiver: user._id },
      ],
    }).populate("sender receiver"); // Populate sender and receiver details

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching chat history", err });
  }
});

// Reply to a message
app.post("/message/reply", authenticate, async (req, res) => {
  const { companyEmail, userEmail, content, originalMessageId } = req.body;

  try {
    const senderEmail = req.user.email;

    const company = await User.findOne({ email: companyEmail });
    const user = await User.findOne({ email: userEmail });

    if (!company || company.userType !== "Company") {
      return res.status(404).json({ error: "Company not found or invalid userType" });
    }

    if (!user || user.userType !== "User") {
      return res.status(404).json({ error: "User not found or invalid userType" });
    }

    const originalMessage = await Message.findById(originalMessageId);

    if (!originalMessage) {
      return res.status(404).json({ error: `Message with ID ${originalMessageId} not found` });
    }

    if (originalMessage.receiver.toString() !== company._id.toString()) {
      return res.status(404).json({
        error: `Message recipient mismatch. Expected company ID, but found: ${originalMessage.receiver.toString()}`
      });
    }

    const replyMessage = new Message({
      sender: company._id,
      receiver: user._id,
      content,
      timestamp: new Date(),
      originalMessageId: originalMessage._id,
    });

    await replyMessage.save();

    io.to(user._id.toString()).emit('newMessage', replyMessage);

    res.status(200).json({ message: "Reply sent successfully", replyMessage });
  } catch (err) {
    res.status(500).json({ error: "Error sending reply", err });
  }
});

// Socket.io logic
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register', (userId) => {
    console.log(`User ${userId} connected`);
    socket.join(userId);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message } = data;
    io.to(receiverId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});