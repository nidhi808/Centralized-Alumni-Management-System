import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaUserCircle, FaSearch, FaEllipsisV, FaCircle } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { subscribeToMessages, sendMessage } from '../../services/facultyService';

export default function AlumniChat() {
  const { currentUser } = useAuth();
  const [connections, setConnections] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // 1. Fetch real active mentorship connections
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, 'connections'),
      where('toId', '==', currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const allConns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setConnections(allConns.filter(c => c.status === 'accepted'));
    });
    return () => unsub();
  }, [currentUser]);

  // 2. Fetch messages for the selected chat
  useEffect(() => {
    if (!activeContact || !currentUser) return;
    const chatId = [currentUser.uid, activeContact.fromId].sort().join('_');
    const unsub = subscribeToMessages(chatId, setMessages);
    return () => unsub();
  }, [activeContact, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeContact) return;

    const msgText = newMessage.trim();
    setNewMessage(''); // optimistic UI

    try {
      const chatId = [currentUser.uid, activeContact.fromId].sort().join('_');
      await sendMessage(chatId, currentUser.uid, msgText);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const filteredContacts = connections.filter(c => 
    (c.fromId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-7xl mx-auto py-6 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
        
        {/* Contacts Sidebar */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
          <div className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-３xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg shrink-0">
            <h2 className="text-2xl font-bold text-text dark:text-white mb-4">Messages</h2>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-sm"
              />
            </div>
          </div>

          <div className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex-1 overflow-hidden flex flex-col">
             <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {filteredContacts.length === 0 ? (
                  <div className="text-center text-text-muted py-8 text-sm">
                    No active mentees yet.
                  </div>
                ) : (
                  filteredContacts.map(contact => (
                    <motion.div 
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveContact(contact)}
                      className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors ${
                        activeContact?.id === contact.id 
                          ? 'bg-primary/10 border-primary/20 border shadow-sm' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
                          {contact.fromId?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-text dark:text-gray-100 truncate pr-2">Student {contact.fromId?.slice(0, 6)}</h4>
                        </div>
                        <p className={`text-xs truncate text-text-muted dark:text-gray-400`}>
                          Mentee
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Active Chat Area */}
        <div className="flex-1 glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col overflow-hidden relative">
          
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm border border-gray-200 dark:border-gray-600">
                      {activeContact.fromId?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-text dark:text-white text-lg">Student {activeContact.fromId?.slice(0, 6)}</h3>
                    <p className="text-xs text-text-muted dark:text-gray-400 font-medium">
                      Online now
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-text-muted transition-colors">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
                <AnimatePresence>
                  {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    return (
                      <motion.div 
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className="shrink-0 pt-1">
                          {isMe ? (
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                              <FaUserCircle size={20} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                              {activeContact.fromId?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          )}
                        </div>
                        <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            isMe 
                              ? 'bg-gradient-to-br from-primary to-primary-light text-white rounded-tr-sm' 
                              : 'bg-white dark:bg-gray-700 text-text dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-tl-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-text-muted font-medium px-1">
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 z-10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-2xl border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all shadow-sm">
                  <input 
                    type="text" 
                    placeholder={`Reply to Student ${activeContact.fromId?.slice(0, 6)}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-text dark:text-white placeholder:text-gray-400"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <FaPaperPlane className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted z-10">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
                <FaPaperPlane size={32} className="text-gray-300 dark:text-gray-500" />
              </div>
              <p className="text-lg font-bold text-text dark:text-gray-300">Your Messages</p>
              <p className="text-sm">Select a connection to start chatting.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
