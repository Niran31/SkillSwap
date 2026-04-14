import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Send, User, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define the shape of a message
interface MessageData {
  room: string;
  author: string;
  authorName: string;
  message: string;
  time: string;
}

// Global socket definition so it doesn't reconnect on tight rerenders
let socket: Socket;

const Messages: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState<MessageData[]>([]);
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Extract peerId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const peerId = queryParams.get('peerId');

  // We define the room ID by sorting user and peer IDs to be identical on both ends
  const room = user && peerId ? [user.id, peerId].sort().join('_') : '';

  useEffect(() => {
    if (!isAuthenticated || !room) return;

    // Initialize socket connection
    socket = io('http://localhost:5000');
    socket.emit('join_room', room);

    socket.on('receive_message', (data: MessageData) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, room]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage !== '' && user && room) {
      const messageData: MessageData = {
        room: room,
        author: user.id,
        authorName: user.name,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + (new Date(Date.now()).getMinutes() < 10 ? '0' : '') + new Date(Date.now()).getMinutes(),
      };

      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-800">Please sign in to view messages.</h2>
      </div>
    );
  }

  if (!peerId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h2 className="text-xl text-gray-600">Select a peer from the matchmaking page to start chatting!</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-[70vh]">
        
        {/* Chat Header */}
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center mr-3">
              <User className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Live Chat</h3>
              <p className="text-blue-100 text-xs flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span> Protected Connection
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-4" ref={scrollRef}>
          {messageList.length === 0 ? (
            <div className="m-auto text-center text-gray-400 p-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Send a greeting!</p>
            </div>
          ) : (
            messageList.map((msg, index) => {
              const isMe = msg.author === user.id;
              return (
                <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] rounded-xl p-3 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                    {!isMe && <span className="block text-xs font-bold text-blue-600 mb-1">{msg.authorName}</span>}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <span className={`block text-[10px] mt-1 ${isMe ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-200 flex">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type your message..."
            onChange={(event) => setCurrentMessage(event.target.value)}
            onKeyPress={(event) => {
              event.key === 'Enter' && sendMessage();
            }}
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg transition flex items-center justify-center disabled:opacity-50"
            disabled={!currentMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Messages;
