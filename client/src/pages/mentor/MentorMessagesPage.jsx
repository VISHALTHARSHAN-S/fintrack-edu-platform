import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  CheckCheck,
  Circle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchConversations, fetchMessageHistory, sendMessageApi } from '../../services/mentorMessageService';

const MentorMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const convs = await fetchConversations();
      if (isMounted) {
        setConversations(convs);
        if (convs.length > 0) {
          setActiveStudentId(convs[0].studentId);
          const thread = await fetchMessageHistory(convs[0].studentId);
          setActiveThread(thread);
        }
        setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectConversation = async (studentId) => {
    setActiveStudentId(studentId);
    const thread = await fetchMessageHistory(studentId);
    setActiveThread(thread);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeStudentId) return;

    const text = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    try {
      const newMsg = await sendMessageApi(activeStudentId, text);
      setActiveThread((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), newMsg],
      }));
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 pb-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-extrabold text-white">Student Communication Workspace</h1>
        </div>
      </div>

      {/* MESSAGING CONTAINER */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/40">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConvs.map((conv) => {
              const isActive = conv.studentId === activeStudentId;
              return (
                <div
                  key={conv.conversationId}
                  onClick={() => handleSelectConversation(conv.studentId)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isActive ? 'bg-purple-50/80 border-l-4 border-purple-700' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs">
                        {conv.studentName.slice(0, 2)}
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 border-2 border-white ${
                          conv.onlineStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{conv.studentName}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                    {conv.unreadCount > 0 && (
                      <span className="block w-4 h-4 rounded-full bg-purple-700 text-white text-[9px] font-bold leading-4 text-center ml-auto">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT THREAD */}
        <div className="flex-1 flex flex-col bg-white">
          {activeThread ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-brand-600 text-white font-bold flex items-center justify-center text-xs">
                    {activeThread.studentName.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeThread.studentName}</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Student
                    </p>
                  </div>
                </div>
              </div>

              {/* CHAT HISTORY */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20">
                {activeThread.messages?.map((msg) => {
                  const isMentor = msg.senderId === 'mentor_1';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMentor ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isMentor
                            ? 'bg-purple-700 text-white rounded-br-none shadow-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
              </div>

              {/* MESSAGE INPUT FORM */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
                <input
                  type="text"
                  placeholder="Type your message to student..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  isLoading={isSending}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-5"
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a student conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorMessagesPage;
