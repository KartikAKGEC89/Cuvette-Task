import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompanyDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null); // Track selected message
  const [replyContent, setReplyContent] = useState(''); // Track reply content
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token'); // Get the token from local storage
      if (!token) {
        setError('No authorization token found.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/messages/company', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token as Authorization header
          },
        });

        // Log the response data to check the structure
        console.log(response.data.messages);

        const fetchedMessages = response.data.messages.map((msg) => {
          // Ensure msg.sender and msg.company exist before accessing their properties
          const senderName = msg.sender?.name || 'Unknown'; // Fallback to 'Unknown' if sender is undefined
          const senderEmail = msg.sender?.email || 'Unknown Email'; // Fallback if sender email is undefined
          const companyEmail = msg.company?.email || 'Unknown Company Email'; // Fallback if company email is undefined

          return {
            id: msg._id, // Use message ID as a unique ID
            userInitial: senderName.charAt(0).toUpperCase(),
            userName: senderName,
            pageTitle: msg.content.slice(0, 20), // Extract first 20 characters of message content
            messagePreview: msg.content.slice(0, 40), // Extract first 40 characters of message content
            time: new Date(msg.timestamp).toLocaleString(), // Format timestamp
            userEmail: senderEmail,
            companyEmail: companyEmail,
            originalMessageId: msg._id,
          };
        });

        setMessages(fetchedMessages);
      } catch (err) {
        setError('Error fetching messages');
        console.error(err);
      }
    };

    fetchMessages();

    // Cleanup on component unmount
    return () => setMessages([]);
  }, []);

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
  };

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    const token = localStorage.getItem('token'); // Get the token from local storage

    // Ensure token is present
    if (!token) {
      console.error('No authorization token found.');
      return;
    }

    const { userEmail, originalMessageId } = selectedMessage;

    const companyEmail = localStorage.getItem('email');

    try {
      const response = await axios.post('http://localhost:8080/message/reply', {
        companyEmail, // Use the companyEmail from decoded token
        userEmail,
        content: replyContent,
        originalMessageId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token as Authorization header
        },
      });

      console.log('Reply sent:', response.data);
      setReplyContent(''); // Clear the reply input
      setSelectedMessage(null); // Optionally, reset the selected message
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-20 bg-black text-white p-4 flex flex-col justify-between h-screen">
        {/* Navbar Links */}
        <div className="mt-10">
          <ul className="space-y-12">
            {/* Sidebar Links */}
            {['home', 'settings', 'notifications', 'messages'].map((item, index) => (
              <li key={index} className="text-center">
                <a href="#">
                  <span className="h-6 w-6 text-gray-500 mx-auto">
                    <svg width="20" height="20" fill="currentColor" className="m-auto" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1024 1131q0-64-9-117.5t-29.5-103-60.5-78-97-28.5q-6 4-30 18t-37.5 21.5-35.5 17.5-43 14.5-42 4.5-42-4.5-43-14.5-35.5-17.5-37.5-21.5-30-18q-57 0-97 28.5t-60.5 78-29.5 103-9 117.5 37 106.5 91 42.5h512q54 0 91-42.5t37-106.5z"></path>
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white shadow-md">
          <h1 className="text-lg font-medium">My open conversations ({messages.length})</h1>
          <div className="flex space-x-4 items-center">
            <input
              type="text"
              placeholder="Search"
              className="border p-2 rounded"
            />
            <button className="bg-blue-500 text-white p-2 rounded">
              Freddy
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Message List */}
          <div className="w-1/4 p-4 bg-white shadow-md">
            {error && <div className="text-red-500">{error}</div>}
            {messages.length === 0 ? (
              <p>No messages</p>
            ) : (
              <ul>
                {messages.map((msg) => (
                  <li key={msg.id} className="flex space-x-4 mb-4 cursor-pointer" onClick={() => handleSelectMessage(msg)}>
                    <div className="w-10 h-10 bg-gray-300 rounded-full text-white flex items-center justify-center">
                      {msg.userInitial}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-medium">{msg.userName}</h2>
                      <p className="text-gray-500">{msg.pageTitle}</p>
                      <p className="text-sm text-gray-400">{msg.messagePreview}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">{msg.time}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Content (Selected Message & Reply Form) */}
          <div className="flex-1 p-4 bg-white shadow-md">
            {selectedMessage ? (
              <div className="w-full border rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-green-600 text-white p-4">
                  <h2 className="text-lg font-semibold">Message from {selectedMessage.userName}</h2>
                  <p className="text-sm">{selectedMessage.messagePreview}</p>
                </div>

                {/* Message Content */}
                <div className="p-4 bg-gray-50">
                  {/* Chat Message */}
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full font-bold">
                      {selectedMessage.userName[0].toUpperCase()}
                    </div>

                    {/* Message Bubble */}
                    <div className="bg-white text-gray-700 p-3 rounded-lg shadow">
                      <p className="text-sm font-medium">{selectedMessage.userName}</p>
                      <p className="text-sm">{selectedMessage.message}</p>
                    </div>
                  </div>
                </div>

                {/* Reply Section */}
                <div className="p-4 bg-white border-t">
                  <textarea
                    value={replyContent}
                    onChange={handleReplyChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Write your reply..."
                  ></textarea>

                  <button
                    onClick={handleSendReply}
                    className="mt-3 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  > send reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-4 bg-white shadow-md flex items-center justify-center flex-col">
                <h2 className="mt-4 text-xl font-bold text-gray-700">Hello there, Batch 👋</h2>
                <p className="text-gray-500">Time to ace those conversations. 🚀</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;