import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useToast } from '../../components/ui/Toast';
import { subscribeToConnections, subscribeToMessages, sendMessage } from '../../services/facultyService';
import {
  FaComments, FaPaperPlane, FaSpinner, FaUser, FaCircle
} from 'react-icons/fa';

export default function FacultyChatHub() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToConnections(currentUser.uid, (conns) => {
      setConnections(conns.filter(c => c.status === 'accepted'));
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedChat) return;
    const chatId = [currentUser.uid, selectedChat.toId].sort().join('_');
    const unsub = subscribeToMessages(chatId, setMessages);
    return () => unsub();
  }, [selectedChat, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;
    setSending(true);
    try {
      const chatId = [currentUser.uid, selectedChat.toId].sort().join('_');
      await sendMessage(chatId, currentUser.uid, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error(err);
      addToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <FacultyLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Chat Hub</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real-time messaging with connected alumni. Accept a connection request to start chatting.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col shrink-0">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaComments className="text-[#086490]" /> Conversations
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {connections.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <FaUser className="text-3xl mx-auto mb-2 text-gray-300" />
                <p>No active connections.</p>
                <p className="text-xs mt-1">Connect with alumni to start chatting.</p>
              </div>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => setSelectedChat(conn)}
                  className={`w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50
                    ${selectedChat?.id === conn.id ? 'bg-[#086490]/5 dark:bg-[#086490]/10' : ''}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#086490] to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {conn.toId?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <FaCircle className="absolute -bottom-0.5 -right-0.5 text-emerald-400 text-[8px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      Alumnus {conn.toId?.slice(0, 6)}
                    </p>
                    <p className="text-xs text-gray-400 truncate">Click to chat</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#086490]/10 flex items-center justify-center">
                  <FaComments className="text-3xl text-[#086490]" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">Select a Conversation</h3>
                <p className="text-sm text-gray-400 max-w-sm">Choose a contact from the sidebar to start messaging in real-time.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#086490] to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                  {selectedChat.toId?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Alumnus {selectedChat.toId?.slice(0, 6)}</p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                    <FaCircle size={6} /> Online
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc] dark:bg-gray-950">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-12">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUser.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-[#086490] text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-[#086490] hover:bg-[#065478] text-white flex items-center justify-center shadow-lg shadow-[#086490]/25 transition-all disabled:opacity-50"
                >
                  {sending ? <FaSpinner className="animate-spin" size={14} /> : <FaPaperPlane size={14} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
}
