"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Paperclip, SmileIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Dummy data
const DUMMY_CONVERSATIONS = [
  {
    id: 1,
    user: "Maryum Tanvir",
    lastMessage: "Hello, what's the update? Give me some details.",
    messages: [
      { id: 1, text: "Hello, I am looking for a frontend developer", sender: "Maryum Tanvir", timestamp: "10:30 AM" },
      { id: 2, text: "Hello, how may I help you?", sender: "me", timestamp: "10:32 AM" },
      { id: 3, text: "I want an expert frontend developer to develop the frontend of an e-commerce website", sender: "Maryum Tanvir", timestamp: "10:35 AM" },
      { id: 4, text: "Sure, I can do that for you. I have 5 years of frontend development experience under my belt. Let's start!", sender: "me", timestamp: "10:37 AM" },
    ]
  },
  {
    id: 2,
    user: "Maryum Tanvir",
    lastMessage: "Hello, what's the update? Give me some details.",
    messages: []
  },
  {
    id: 3,
    user: "Maryum Tanvir",
    lastMessage: "Hello, what's the update? Give me some details.",
    messages: []
  },
  {
    id: 4,
    user: "Maryum Tanvir",
    lastMessage: "Hello, what's the update? Give me some details.",
    messages: []
  },
  {
    id: 5,
    user: "Maryum Tanvir",
    lastMessage: "Hello, what's the update? Give me some details.",
    messages: []
  },
  {
    id: 6,
    user: "Maryum Tanvir",
    lastMessage: "Hello, what's the update? Give me some details.",
    messages: []
  }
];

// Main component
export default function ChatPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState(DUMMY_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: activeConversation.messages.length + 1,
      text: message,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage]
    };
    
    setActiveConversation(updatedConversation);
    
    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation.id ? updatedConversation : conv
    );
    
    setConversations(updatedConversations);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* We'll use your existing navbar here instead of creating a new one */}
      
      {/* Main content */}
      <div className="flex flex-grow w-full">
        {/* Sidebar */}
        <div className="w-1/4 border-r bg-white">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg flex items-center">
              <div className="w-6 h-6 mr-2 bg-green-100 flex items-center justify-center rounded">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 10.6667C14 11.0203 13.8595 11.3594 13.6095 11.6095C13.3594 11.8595 13.0203 12 12.6667 12H4.66667L2 14.6667V4.66667C2 4.31305 2.14048 3.97391 2.39052 3.72386C2.64057 3.47381 2.97971 3.33333 3.33333 3.33333H12.6667C13.0203 3.33333 13.3594 3.47381 13.6095 3.72386C13.8595 3.97391 14 4.31305 14 4.66667V10.6667Z" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              My Chats
            </h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {conversations.map((convo) => (
              <div 
                key={convo.id} 
                className={`flex items-start p-4 border-b cursor-pointer hover:bg-gray-50 ${activeConversation.id === convo.id ? 'bg-gray-50' : ''}`}
                onClick={() => setActiveConversation(convo)}
              >
               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A6 6 0 0112 15a6 6 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
</div>

                <div className="ml-3 flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm">{convo.user}</h3>
                    <button className="text-gray-500">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{convo.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="w-3/4 flex flex-col bg-white">
          {/* Chat header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">{activeConversation.user}</h2>
            <button className="text-gray-500">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-6">
              {activeConversation.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'me' 
                      ? 'bg-teal-100 text-gray-800' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex items-center max-w-3xl mx-auto">
              <div className="flex-grow relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="py-3 pr-20 pl-3"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Paperclip size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <SmileIcon size={18} />
                  </button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage}
                className="ml-2 bg-teal-500 hover:bg-teal-600 text-white px-4"
              >
                Send
              </Button>
            </div>
          </div>

          {/* Pagination */}
          <div className="py-3 flex justify-center items-center border-t text-sm text-gray-500">
            <span>•</span>
            <span className="mx-2">1</span>
            <span>2</span>
            <span className="mx-2">3</span>
            <span>...</span>
            <span className="mx-2">99</span>
            <span>Next</span>
            <span className="mx-2">•</span>
          </div>
        </div>
      </div>
    </div>
  );
}