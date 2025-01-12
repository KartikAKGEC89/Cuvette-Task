import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [content, setContent] = useState('');
  const [messageStatus, setMessageStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      setMessageStatus('Authorization token is missing');
      return;
    }

    // Prepare request data
    const requestData = {
      receiverEmail,
      content
    };

    try {
      const response = await fetch('http://localhost:8080/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Use JWT token from storage
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessageStatus('Message sent successfully');
      } else {
        setMessageStatus(data.error || 'Error sending message');
      }
    } catch (error) {
      setMessageStatus('Error sending message');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-96 bg-white rounded-lg shadow-lg">
        <h1 className="text-center text-xl font-semibold py-4">User Dashboard</h1>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Receiver Email Field */}
          <div>
            <label
              htmlFor="receiverEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Receiver Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="receiverEmail"
              name="receiverEmail"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter receiver's email"
              required
            />
          </div>

          {/* Message Content Field */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4">
  <button
    type="submit"
    className="w-full bg-blue-500 text-white font-medium py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Send Message
  </button>

  <Link
    to="/userOldchats"
    className=" text-center w-full bg-blue-500 text-white font-medium py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Old Chats
  </Link>
</div>

          </form>
        {/* Message Status */}
        {messageStatus && <p className="text-center text-gray-700 mt-4">{messageStatus}</p>}
      </div>
      
    </div>
  );
};

export default UserDashboard;