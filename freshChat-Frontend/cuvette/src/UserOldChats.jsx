import React, { useEffect, useState } from 'react';

const UserOldChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Retrieve user data (including companyEmail) from local storage or context
  const companyEmail = localStorage.getItem('email'); // Assuming the company email is saved in localStorage
  const token = localStorage.getItem("token"); // Assuming the JWT token is stored in localStorage

  // Fetch old chat messages
  useEffect(() => {
    const fetchChats = async () => {
      if (!companyEmail) {
        setError('Email not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/messages/history?companyEmail=${companyEmail}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.messages) {
          setChats(data.messages);
        } else {
          setError('No messages found');
        }
      } catch (err) {
        setError('Error fetching messages');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [companyEmail, token]);

  if (loading) {
    return <div className="text-center text-lg font-semibold py-4">Loading chats...</div>;
  }

  if (error) {
    return <div className="text-center text-lg font-semibold text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-4 text-center">Old Chats with {companyEmail}</h2>
      <table className="min-w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Sender</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Receiver</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Message</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {chats.map((chat) => (
            <tr key={chat._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-800 border-b">{chat.sender.name}</td>
              <td className="px-6 py-4 text-sm text-gray-800 border-b">{chat.receiver.name}</td>
              <td className="px-6 py-4 text-sm text-gray-800 border-b">{chat.content}</td>
              <td className="px-6 py-4 text-sm text-gray-800 border-b">{new Date(chat.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOldChats;