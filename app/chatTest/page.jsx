'use client';

import { useState, useRef } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello, I am looking for a frontend developer.',
      sender: 'user',
    },
    {
      id: 2,
      text: 'Hello. How may I help you?',
      sender: 'me',
    },
    {
      id: 3,
      text: 'I want an expert frontend developer to develop the frontend of an e-commerce website',
      sender: 'user',
    },
    {
      id: 4,
      text: 'Sure, I can do that for you. I have 5 years of frontend development experience under my belt. Let\'s start!',
      sender: 'me',
    },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || selectedFile) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'me',
        file: selectedFile,
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-8">
      <div className="w-3/5 h-3/5 flex flex-col bg-white rounded-lg border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b flex justify-between items-center">
          <div className="font-medium">Maryum Tanvir</div>
          <button className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg py-2 px-4 max-w-xs ${
                  msg.sender === 'me'
                    ? 'bg-cyan-400 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                {msg.file && (
                  <div className="mt-2 flex items-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>{msg.file.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* File preview */}
        {selectedFile && (
          <div className="px-6 py-2 bg-gray-50 border-t flex items-center">
            <div className="flex-1 text-sm text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {selectedFile.name}
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="border-t px-4 py-3 flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            type="button" 
            className="text-gray-500 p-2"
            onClick={triggerFileInput}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button type="button" className="text-gray-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 py-2 px-3 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-cyan-400 text-white rounded px-4 py-1 ml-2"
            disabled={!message.trim() && !selectedFile}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}