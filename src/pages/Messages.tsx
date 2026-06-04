import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageSquare, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define the shape of a message
interface MessageData {
  room: string;
  author: string;
  authorName: string;
  message: string;
  time: string;
}

interface Conversation {
  peerId: string;
  peerName: string;
  peerAvatar: string;
  room: string;
  lastMessage: string;
  time: string;
}

// Global socket definition so it doesn't reconnect on tight rerenders
let socket: Socket;

const Messages: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState<MessageData[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Extract peerId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const peerId = queryParams.get('peerId');

  // We define the room ID by sorting user and peer IDs to be identical on both ends
  const room = user && peerId ? [user.id, peerId].sort().join('_') : '';

  // Fetch active conversations list
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    setIsLoadingConversations(true);
    axios.get(`/api/messages/conversations/${user.id}`)
      .then(async (res) => {
        const convs = res.data.conversations || [];
        
        // If peerId is in URL but not in active conversations, fetch details and add a draft
        if (peerId && !convs.some((c: Conversation) => c.peerId === peerId)) {
          try {
            const peersRes = await axios.get('/api/peers');
            const allPeers = peersRes.data.peers || [];
            const peerInfo = allPeers.find((p: any) => p.id === peerId);
            
            if (peerInfo) {
              const draftConv: Conversation = {
                peerId: peerId,
                peerName: peerInfo.name,
                peerAvatar: peerInfo.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
                room: [user.id, peerId].sort().join('_'),
                lastMessage: 'No messages yet',
                time: ''
              };
              setConversations([draftConv, ...convs]);
            } else {
              setConversations(convs);
            }
          } catch (e) {
            console.error("Failed to fetch peer info for messaging:", e);
            setConversations(convs);
          }
        } else {
          setConversations(convs);
        }
      })
      .catch(err => console.error("Failed to load conversations:", err))
      .finally(() => setIsLoadingConversations(false));
  }, [isAuthenticated, user, peerId, messageList]);

  // Load message history & connect socket
  useEffect(() => {
    if (!isAuthenticated || !room) return;

    // Fetch initial chat history
    axios.get(`/api/messages/${room}`)
      .then(res => {
        if (res.data.messages) {
          setMessageList(res.data.messages);
        }
      })
      .catch(err => console.error("Failed to load chat history:", err));

    // Initialize socket connection
    socket = io();
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
    if (currentMessage.trim() !== '' && user && room) {
      const now = new Date();
      const messageData: MessageData = {
        room: room,
        author: user.id,
        authorName: user.name,
        message: currentMessage,
        time: now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes(),
      };

      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
      localStorage.setItem('skillswap_sent_message', 'true');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-800">Please sign in to view messages.</h2>
      </div>
    );
  }

  const activeConv = conversations.find(c => c.peerId === peerId);
  const activePeerName = activeConv ? activeConv.peerName : 'Live Chat';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex h-[75vh]">
        
        {/* Conversations Sidebar */}
        <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${peerId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Active Chats
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No active conversations. Book a session or message a peer from matchmaking!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.peerId === peerId;
                return (
                  <div 
                    key={conv.peerId}
                    onClick={() => navigate(`/messages?peerId=${conv.peerId}`)}
                    className={`p-4 flex items-start cursor-pointer hover:bg-blue-50/50 transition ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 text-blue-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{conv.peerName}</h4>
                        <span className="text-[10px] text-gray-400">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Pane */}
        <div className={`flex-1 flex flex-col h-full bg-gray-50 ${!peerId ? 'hidden md:flex' : 'flex'}`}>
          {peerId ? (
            <>
              {/* Chat Header */}
              <div className="bg-blue-600 p-4 text-white flex items-center">
                <button 
                  onClick={() => navigate('/messages')}
                  className="mr-3 md:hidden text-white hover:text-blue-100"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                {activeConv?.peerAvatar ? (
                  <img 
                    src={activeConv.peerAvatar} 
                    alt={activePeerName} 
                    className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="text-white w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{activePeerName}</h3>
                  <p className="text-blue-100 text-[10px] flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></span> Connected
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto p-4 flex flex-col space-y-4" ref={scrollRef}>
                {messageList.length === 0 ? (
                  <div className="m-auto text-center text-gray-400 p-4">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Send a greeting!</p>
                  </div>
                ) : (
                  messageList.map((msg, index) => {
                    const isMe = msg.author === user?.id;
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300 animate-bounce" />
              <h3 className="text-lg font-bold text-gray-700">No Chat Selected</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Select a chat from the active list on the left, or visit the Matchmaking section to message a new peer!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
