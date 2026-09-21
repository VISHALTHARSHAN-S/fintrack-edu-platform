import React, { useEffect, useRef, useState } from 'react';
import { FileText, MessageSquare, Paperclip, Search, Send, UserRound, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import Badge from '../../../components/common/Badge';
import {
  getStudentMentorConversation,
  getStudentMentorConversations,
  sendStudentMentorFile,
  sendStudentMentorMessage,
} from '../../../services/studentMentorService';

const formatTime = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';

const StudentMentorMessagesPage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const messageEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [activeMentorId, setActiveMentorId] = useState(mentorId || '');
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getStudentMentorConversations()
      .then((items) => {
        if (!isMounted) return;
        setConversations(items || []);
        if (!mentorId && items?.[0]) setActiveMentorId(items[0].mentorId);
      })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load your mentor conversations.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [mentorId]);

  useEffect(() => {
    if (!activeMentorId) return undefined;
    let isMounted = true;
    setIsThreadLoading(true);
    setError('');
    getStudentMentorConversation(activeMentorId)
      .then((data) => { if (isMounted) setConversation(data); })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load this conversation.'); })
      .finally(() => { if (isMounted) setIsThreadLoading(false); });
    return () => { isMounted = false; };
  }, [activeMentorId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const selectMentor = (nextMentorId) => {
    setActiveMentorId(nextMentorId);
    navigate(`/student/mentor-messages/${nextMentorId}`);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if ((!message.trim() && !selectedFile) || !activeMentorId) return;
    const content = message.trim();
    setMessage('');
    setIsSending(true);
    setError('');
    try {
      const sentMessage = selectedFile
        ? await sendStudentMentorFile(activeMentorId, selectedFile)
        : await sendStudentMentorMessage(activeMentorId, content);
      setConversation((current) => ({ ...current, messages: [...(current?.messages || []), sentMessage] }));
      setConversations((current) => current.map((item) => item.mentorId === activeMentorId ? { ...item, lastMessage: selectedFile ? selectedFile.name : content, lastMessageTime: sentMessage.timestamp } : item));
      setSelectedFile(null);
    } catch (requestError) {
      setMessage(content);
      setError(requestError.response?.data?.message || 'Unable to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((item) => item.mentorName.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>;

  return (
    <div className="space-y-6 pb-8">
      <section className="bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl"><div className="flex items-center gap-3"><MessageSquare className="w-6 h-6 text-brand-300" /><div><h1 className="text-2xl font-extrabold">My Messages</h1><p className="text-sm text-slate-300 mt-1">Text conversations with mentors from your mentoring sessions.</p></div></div></section>
      {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-sm">{error}</div>}
      {conversations.length === 0 ? <EmptyState title="No mentor conversations yet" description="Book or attend a mentoring session to start a conversation with your mentor." /> : <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        <aside className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50"><div className="p-4 border-b border-slate-100 relative"><Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search mentors..." className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white" /></div><div className="divide-y divide-slate-100">{filteredConversations.map((item) => <button type="button" key={item.mentorId} onClick={() => selectMentor(item.mentorId)} className={`w-full text-left p-4 flex items-center gap-3 ${activeMentorId === item.mentorId ? 'bg-brand-50 border-l-4 border-brand-600' : 'hover:bg-slate-100'}`}><div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">{item.mentorName.slice(0, 2)}</div><div className="min-w-0 flex-1"><p className="font-bold text-sm text-slate-900 truncate">{item.mentorName}</p><p className="text-xs text-slate-500 truncate">{item.lastMessage || 'No messages yet'}</p></div>{item.unreadCount > 0 && <Badge variant="brand" size="xs">{item.unreadCount}</Badge>}</button>)}</div></aside>
        <section className="flex-1 flex flex-col min-w-0">{isThreadLoading ? <div className="p-6"><CardSkeleton /></div> : conversation ? <><header className="p-4 border-b border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold"><UserRound className="w-5 h-5" /></div><div><h2 className="font-bold text-slate-900">{conversation.mentor?.name || 'Mentor'}</h2><p className="text-xs text-slate-500">Mentor conversation</p></div></header><div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30">{conversation.messages?.length ? conversation.messages.map((item) => <div key={item.id} className={`flex flex-col ${item.isMine ? 'items-end' : 'items-start'}`}><div className={`max-w-[min(34rem,85%)] px-4 py-3 rounded-2xl text-sm ${item.isMine ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>{item.messageType === 'file' && item.attachment ? <a href={item.attachment.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline"><FileText className="w-4 h-4" />{item.attachment.fileName}<span className="text-xs no-underline">({Math.ceil(item.attachment.fileSize / 1024)} KB)</span></a> : item.text}</div><span className="text-[10px] text-slate-400 mt-1">{formatTime(item.timestamp)}</span></div>) : <div className="h-full flex items-center justify-center text-sm text-slate-400">No messages yet. Start the conversation.</div>}<div ref={messageEndRef} /></div><form onSubmit={handleSend} className="p-4 border-t border-slate-100 space-y-2"><div className="flex gap-3"><label className="p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50" title="Attach file"><Paperclip className="w-4 h-4" /><input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} /></label><input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Type your message..." className="flex-1 p-3 text-sm border border-slate-200 rounded-xl" /><Button type="submit" icon={Send} isLoading={isSending} isDisabled={!message.trim() && !selectedFile}>Send</Button></div>{selectedFile && <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2"><Paperclip className="w-3.5 h-3.5" />{selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} KB)<button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove selected file" className="ml-auto text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button></div>}</form></> : <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Select a mentor conversation.</div>}</section>
      </div>}
    </div>
  );
};

export default StudentMentorMessagesPage;