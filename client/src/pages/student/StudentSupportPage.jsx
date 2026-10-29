import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  GraduationCap,
  MessageCircle,
  MessageSquareText,
  Search,
  Send,
  Settings,
  Sparkles,
  Ticket,
  Paperclip,
  X,
} from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import CardSkeleton, { ListSkeleton } from '../../components/common/LoadingSkeleton';
import { loadNotifications } from '../../features/notifications/notificationSlice';
import {
  createSupportTicket,
  fetchSupportTicket,
  fetchSupportTickets,
  reopenSupportTicket,
  replyToSupportTicket,
} from '../../services/studentSupportService';

const categories = [
  { name: 'Account & Settings', icon: Settings, description: 'Profile, login, and preferences' },
  { name: 'Courses & Learning', icon: BookOpen, description: 'Courses, lessons, and learning progress' },
  { name: 'Assessments', icon: FileCheck2, description: 'Exams, assignments, and results' },
  { name: 'Certificates', icon: Award, description: 'Certificates and verification' },
  { name: 'Skill Tracker', icon: Sparkles, description: 'Skills, evidence, and milestones' },
  { name: 'Career & Jobs', icon: Briefcase, description: 'Job search and career profile' },
  { name: 'Applications', icon: GraduationCap, description: 'Applications and interviews' },
  { name: 'Notifications', icon: Bell, description: 'Alerts and notification settings' },
];

const faqs = [
  { category: 'Account & Settings', question: 'How do I update my profile?', answer: 'Open Settings from the sidebar to update your profile details, password, notification preferences, and appearance.' },
  { category: 'Account & Settings', question: 'I cannot sign in to my account. What should I do?', answer: 'Use Forgot password on the sign-in page to reset your password. If you still cannot access your account, raise a ticket with the email address on your account.' },
  { category: 'Courses & Learning', question: 'How do I find my enrolled courses?', answer: 'Open My Learning / My Courses in the sidebar. Your enrolled courses and learning progress are shown there.' },
  { category: 'Courses & Learning', question: 'My lesson progress did not update. What can I check?', answer: 'Confirm that the lesson finished loading and that your connection stayed active. Reopen the lesson once; if progress is still missing, include the course and lesson name in a support request.' },
  { category: 'Assessments', question: 'Where can I see my assessment results?', answer: 'Open Assessment Center to view assessment attempts and results. Exams and assignments are available from the Exams & Assignments page.' },
  { category: 'Assessments', question: 'I had a problem during an assessment. What details should I provide?', answer: 'Include the assessment name, approximate time, and what happened. Do not include passwords or other sensitive account information.' },
  { category: 'Certificates', question: 'Where can I find my certificates?', answer: 'Open Certificates from the student sidebar. Earned certificates and their verification information appear on that page.' },
  { category: 'Certificates', question: 'How can someone verify my certificate?', answer: 'Use the verification link shown with the certificate. If the certificate details are incorrect, raise a support request and include its title.' },
  { category: 'Skill Tracker', question: 'How are skills added to my tracker?', answer: 'The tracker reflects skills evidenced by your learning and assessment activity. Open Skill Tracker to review your skills and progress.' },
  { category: 'Career & Jobs', question: 'How do I update my career profile?', answer: 'Open Career & Jobs and choose your career profile. Keep your skills, preferred roles, locations, and resume details current.' },
  { category: 'Career & Jobs', question: 'Why can I not apply to a job?', answer: 'Check that the job is still accepting applications and that your career profile is complete. If an active listing still fails, include its title in a support request.' },
  { category: 'Applications', question: 'Where can I check an application status?', answer: 'Open Career & Jobs, then My Applications. Application updates and interview details appear in their respective sections.' },
  { category: 'Applications', question: 'How do I prepare for an interview?', answer: 'Review the interview details in your Career & Jobs area. Contact support if the interview information appears incomplete or incorrect.' },
  { category: 'Notifications', question: 'How do I change which notifications I receive?', answer: 'Open Settings and select Notifications to manage the platform update preferences available for your account.' },
  { category: 'Notifications', question: 'Why did a notification not appear?', answer: 'Check your notification preferences and the Notifications page. If a specific expected update is missing, include its event and approximate date in your request.' },
];

const statusStyles = {
  Open: 'border-sky-200 bg-sky-50 text-sky-800',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-800',
  Resolved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Closed: 'border-slate-200 bg-slate-100 text-slate-700',
};

const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(date));

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.Open}`}>
    {status}
  </span>
);

const FAQItem = ({ item }) => (
  <details className="group rounded-2xl border border-slate-200 bg-white">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-slate-800 marker:hidden sm:px-5">
      {item.question}
      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
    </summary>
    <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600 sm:px-5">{item.answer}</p>
  </details>
);

const TicketCard = ({ ticket, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm sm:p-5"
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{ticket.ticketId}</p>
        <h3 className="mt-1 truncate font-semibold text-slate-900">{ticket.subject}</h3>
      </div>
      <StatusBadge status={ticket.status} />
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
      <span>{ticket.category}</span>
      <span>Created {formatDate(ticket.createdAt)}</span>
    </div>
  </button>
);

const TicketForm = ({ onCancel, onCreated }) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    category: categories[0].name,
    subject: '',
    description: '',
    priority: 'Medium',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.subject.trim().length < 5 || form.subject.trim().length > 120) {
      setError('Subject must be between 5 and 120 characters.');
      return;
    }
    if (form.description.trim().length < 20 || form.description.trim().length > 5000) {
      setError('Description must be between 20 and 5,000 characters.');
      return;
    }

    setSaving(true);
    try {
      const ticket = await createSupportTicket({
        ...form,
        subject: form.subject.trim(),
        description: form.description.trim(),
        attachment: selectedFile,
      });
      onCreated(ticket);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <button type="button" onClick={onCancel} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Help Center
      </button>
      <div className="mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-800"><Ticket className="h-5 w-5" /></div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Raise a support request</h2>
        <p className="mt-1 text-sm text-slate-500">Tell us what happened. Your ticket ID will be generated after submission.</p>
      </div>
      {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Issue category</span>
          <select name="category" value={form.category} onChange={change} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
            {categories.map((category) => <option key={category.name}>{category.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Subject</span>
          <input name="subject" required minLength={5} maxLength={120} value={form.subject} onChange={change} placeholder="Briefly summarize the issue" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Detailed description</span>
          <textarea name="description" required minLength={20} maxLength={5000} rows={6} value={form.description} onChange={change} placeholder="Include what you were trying to do and what happened." className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <span className="mt-1 block text-xs text-slate-500">{form.description.length}/5,000 characters</span>
        </label>
        <label className="block max-w-xs">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Priority</span>
          <select name="priority" value={form.priority} onChange={change} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
            {['Low', 'Medium', 'High'].map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </label>
        <div>
          <label htmlFor="support-attachment" className="mb-1.5 block text-sm font-medium text-slate-700">Attachment <span className="font-normal text-slate-500">(optional)</span></label>
          <input
            ref={fileInputRef}
            id="support-attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              if (!file) {
                setSelectedFile(null);
                return;
              }
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
              if (!allowedTypes.includes(file.type)) {
                setError('Attach a PNG, JPEG, WebP, or PDF file.');
                event.target.value = '';
                setSelectedFile(null);
                return;
              }
              if (file.size > 5 * 1024 * 1024) {
                setError('Attachment size must be 5 MB or less.');
                event.target.value = '';
                setSelectedFile(null);
                return;
              }
              setError('');
              setSelectedFile(file);
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <p className="mt-1 text-xs text-slate-500">PNG, JPEG, WebP, or PDF · maximum 5 MB</p>
          {selectedFile && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <Paperclip className="h-3.5 w-3.5" />{selectedFile.name}
              <button type="button" onClick={() => { setSelectedFile(null); fileInputRef.current.value = ''; }} aria-label="Remove attachment" className="ml-auto text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" isLoading={saving} icon={Send}>Submit request</Button>
        </div>
      </form>
    </section>
  );
};

const TicketDetails = ({ ticket, ticketId, loading, error, onBack, onRetry, onRefresh }) => {
  const [reply, setReply] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reopening, setReopening] = useState(false);

  const submitReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    setSaving(true);
    setActionError('');
    try {
      await replyToSupportTicket(ticket.ticketId, reply.trim());
      setReply('');
      await onRefresh(ticket.ticketId);
    } catch (replyError) {
      setActionError(replyError.message);
    } finally {
      setSaving(false);
    }
  };

  const reopen = async () => {
    setReopening(true);
    setActionError('');
    try {
      await reopenSupportTicket(ticket.ticketId);
      await onRefresh(ticket.ticketId);
    } catch (reopenError) {
      setActionError(reopenError.message);
    } finally {
      setReopening(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (error) return <ErrorState description={error} onRetry={() => onRetry(ticketId)} />;
  if (!ticket) return null;

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> My support requests
      </button>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{ticket.ticketId}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{ticket.subject}</h2>
            <p className="mt-2 text-sm text-slate-500">{ticket.category} · Created {formatDate(ticket.createdAt)}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <p><span className="font-semibold text-slate-700">Priority:</span> <span className="text-slate-600">{ticket.priority}</span></p>
          <p><span className="font-semibold text-slate-700">Last updated:</span> <span className="text-slate-600">{formatDate(ticket.updatedAt)}</span></p>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Issue description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{ticket.description}</p>
          {ticket.attachment && (
            <a href={ticket.attachment.fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-brand-800 hover:bg-slate-50">
              <Paperclip className="h-4 w-4" /> {ticket.attachment.fileName}
            </a>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Clock3 className="h-4 w-4 text-brand-700" /> Ticket history</h3>
        <ol className="mt-5 space-y-4">
          {ticket.statusHistory.map((event) => (
            <li key={event.id} className="flex gap-3 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              <div>
                <p className="text-slate-700">{event.fromStatus ? `Status changed from ${event.fromStatus} to ${event.toStatus}` : `Request created with status ${event.toStatus}`}</p>
                <p className="mt-1 text-xs text-slate-500">{event.actorName} · {formatDate(event.createdAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900"><MessageCircle className="h-4 w-4 text-brand-700" /> Conversation</h3>
        {ticket.messages.length ? (
          <div className="mt-5 space-y-4">
            {ticket.messages.map((message) => (
              <article key={message.id} className={`max-w-3xl rounded-2xl p-4 ${message.senderRole === 'student' ? 'ml-auto bg-brand-50' : 'bg-slate-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{message.senderName}{message.senderRole === 'support' ? ' · Support' : ' · You'}</p>
                  <time className="text-xs text-slate-500">{formatDate(message.createdAt)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{message.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No replies yet. Updates from support will appear here.</p>
        )}
        {actionError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{actionError}</p>}
        {['Open', 'In Progress'].includes(ticket.status) ? (
          <form onSubmit={submitReply} className="mt-6 border-t border-slate-100 pt-5">
            <label htmlFor="support-reply" className="mb-1.5 block text-sm font-medium text-slate-700">Add a reply</label>
            <textarea id="support-reply" value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} rows={3} placeholder="Add more information to your request" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            <div className="mt-3 flex justify-end"><Button type="submit" isLoading={saving} isDisabled={!reply.trim()} icon={Send}>Send reply</Button></div>
          </form>
        ) : (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 text-sm text-slate-500">This request is {ticket.status.toLowerCase()}. Reopen it if you still need help.</p>
            <Button variant="secondary" isLoading={reopening} onClick={reopen}>Reopen request</Button>
          </div>
        )}
      </section>
    </div>
  );
};

const StudentSupportPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketId = searchParams.get('ticket');
  const [view, setView] = useState('help');
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('All categories');
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [ticketListLoading, setTicketListLoading] = useState(false);
  const [ticketListError, setTicketListError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketListRefresh, setTicketListRefresh] = useState(0);

  const visibleFaqs = useMemo(() => faqs.filter((faq) => {
    const query = faqSearch.trim().toLowerCase();
    const matchesCategory = faqCategory === 'All categories' || faq.category === faqCategory;
    return matchesCategory && (!query || `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(query));
  }), [faqCategory, faqSearch]);

  useEffect(() => {
    if (view !== 'requests' || ticketId) return undefined;
    let active = true;
    const timer = setTimeout(async () => {
      setTicketListLoading(true);
      setTicketListError('');
      try {
        const data = await fetchSupportTickets({
          search: ticketSearch,
          status: statusFilter,
          page: pagination.page,
          limit: 10,
        });
        if (active) {
          setTickets(data.tickets);
          setPagination(data.pagination);
        }
      } catch (error) {
        if (active) setTicketListError(error.message);
      } finally {
        if (active) setTicketListLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pagination.page, statusFilter, ticketId, ticketListRefresh, ticketSearch, view]);

  useEffect(() => {
    if (!ticketId) {
      setSelectedTicket(null);
      setTicketError('');
      setTicketLoading(false);
      return undefined;
    }
    let active = true;
    setTicketLoading(true);
    setTicketError('');
    fetchSupportTicket(ticketId)
      .then((ticket) => {
        if (active) setSelectedTicket(ticket);
      })
      .catch((error) => {
        if (active) setTicketError(error.message);
      })
      .finally(() => {
        if (active) setTicketLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ticketId]);

  const openTicket = (id) => {
    setSelectedTicket(null);
    setSearchParams({ ticket: id });
  };
  const refreshTicket = async (id) => {
    const latest = await fetchSupportTicket(id);
    setSelectedTicket(latest);
  };
  const retryTicket = async (id) => {
    setTicketLoading(true);
    setTicketError('');
    try {
      await refreshTicket(id);
    } catch (error) {
      setTicketError(error.message);
    } finally {
      setTicketLoading(false);
    }
  };
  const closeTicket = () => {
    setSearchParams({});
    setView('requests');
  };
  const ticketCreated = (ticket) => {
    setTickets((current) => [ticket, ...current]);
    dispatch(loadNotifications());
    setView('requests');
    setSearchParams({ ticket: ticket.ticketId });
  };

  if (ticketId) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        ticketId={ticketId}
        loading={ticketLoading}
        error={ticketError}
        onBack={closeTicket}
        onRetry={retryTicket}
        onRefresh={refreshTicket}
      />
    );
  }

  if (view === 'new') {
    return <TicketForm onCancel={() => setView('help')} onCreated={ticketCreated} />;
  }

  if (view === 'requests') {
    return (
      <SupportRequestsPage
        onBack={() => setView('help')}
        onNewTicket={() => setView('new')}
        tickets={tickets}
        pagination={pagination}
        loading={ticketListLoading}
        error={ticketListError}
        search={ticketSearch}
        setSearch={(value) => {
          setTicketSearch(value);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        status={statusFilter}
        setStatus={(value) => {
          setStatusFilter(value);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onRetry={() => setTicketListRefresh((current) => current + 1)}
        onOpen={openTicket}
      />
    );
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-100"><CircleHelp className="h-4 w-4" /> FINTRACK EDU HELP CENTER</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">How can we help you?</h2>
            <p className="mt-2 text-sm leading-6 text-brand-50">Browse answers or send us a support request. Your requests are saved securely to your account.</p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-48">
            <Button variant="secondary" icon={Ticket} onClick={() => setView('new')}>Raise a request</Button>
            <button type="button" onClick={() => setView('requests')} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              <MessageSquareText className="h-4 w-4" /> My support requests
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Browse help topics</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a topic to filter the most common questions.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map(({ name, icon: Icon, description }) => (
            <button
              key={name}
              type="button"
              onClick={() => { setFaqCategory(name); document.getElementById('support-faqs')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${faqCategory === name ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white'}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-brand-800"><Icon className="h-5 w-5" /></span>
              <span className="mt-3 block text-sm font-semibold text-slate-900">{name}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="support-faqs" className="scroll-mt-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Frequently asked questions</h2>
            <p className="mt-1 text-sm text-slate-500">Search for a question or filter by category.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:min-w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={faqSearch} onChange={(event) => setFaqSearch(event.target.value)} placeholder="Search help articles" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </label>
            <select value={faqCategory} onChange={(event) => setFaqCategory(event.target.value)} aria-label="Filter FAQs by category" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
              <option>All categories</option>
              {categories.map((category) => <option key={category.name}>{category.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {visibleFaqs.length ? visibleFaqs.map((faq) => <FAQItem key={faq.question} item={faq} />) : (
            <EmptyState icon={Search} title="No answers found" description="Try another search or category. If you still need help, send a support request." actionText="Raise a request" onAction={() => setView('new')} />
          )}
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-slate-900">Still need a hand?</h3>
            <p className="mt-1 text-sm text-slate-600">Share the details and track your request from your account.</p>
          </div>
          <Button variant="outline" icon={ArrowRight} onClick={() => setView('new')}>Contact support</Button>
        </div>
      </section>
    </div>
  );
};

const SupportRequestsPage = ({ onBack, onNewTicket, tickets, pagination, loading, error, search, setSearch, status, setStatus, onPageChange, onRetry, onOpen }) => (
  <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Help Center</button>
        <h2 className="text-2xl font-bold text-slate-900">My support requests</h2>
        <p className="mt-1 text-sm text-slate-500">Review request status and continue a conversation.</p>
      </div>
      <Button icon={Ticket} onClick={onNewTicket}>Raise a request</Button>
    </div>
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
      <label className="relative block flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subject, ticket ID, or category" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter requests by status" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
        <option value="all">All statuses</option>
        {['Open', 'In Progress', 'Resolved', 'Closed'].map((value) => <option key={value}>{value}</option>)}
      </select>
    </div>
    {error ? <ErrorState description={error} onRetry={onRetry} /> : loading ? (
      <ListSkeleton rows={4} />
    ) : tickets.length ? (
      <>
        <div className="space-y-3">{tickets.map((ticket) => <TicketCard key={ticket.ticketId} ticket={ticket} onOpen={() => onOpen(ticket.ticketId)} />)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>{pagination.total} request{pagination.total === 1 ? '' : 's'} · Page {pagination.page} of {Math.max(pagination.pages, 1)}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" isDisabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" isDisabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</Button>
          </div>
        </div>
      </>
    ) : (
      <EmptyState icon={Ticket} title="No support requests yet" description={search || status !== 'all' ? 'No requests match these filters. Try another search or status.' : 'When you contact support, your requests and their updates will appear here.'} actionText="Raise a request" onAction={onNewTicket} />
    )}
  </div>
);

export default StudentSupportPage;
