const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  originalMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },  // Link to original message for replies
});

module.exports = mongoose.model("Message", messageSchema);