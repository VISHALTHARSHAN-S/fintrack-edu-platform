import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchMentorStudents, fetchMentorAvailability } from '../../services/mentorService';
import { createSessionApi } from '../../services/mentorSessionService';

const NewSessionPage = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [topic, setTopic] = useState('HFT Strategy Review & Backtesting Optimization');
  const [sessionType, setSessionType] = useState('1-on-1 Mentorship');
  const [sessionDate, setSessionDate] = useState('2026-09-14');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 10:45 AM');
  const [agenda, setAgenda] = useState('1. Code Review\n2. VaR Model Optimization\n3. Q&A');
  const [notes, setNotes] = useState('Pre-session student backtest logs attached.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadFormData = async () => {
      setIsLoading(true);
      const [stList, availData] = await Promise.all([
        fetchMentorStudents(),
        fetchMentorAvailability(),
      ]);
      if (isMounted) {
        setStudents(stList);
        setAvailability(availData);
        if (stList.length > 0) setSelectedStudentId(stList[0].studentId);
        setIsLoading(false);
      }
    };
    loadFormData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !topic) return;

    setIsSubmitting(true);
    try {
      await createSessionApi({
        studentId: selectedStudentId,
        topic,
        sessionType,
        date: sessionDate,
        timeSlot: selectedSlot,
        agenda,
        notes,
      });
      navigate('/mentor/sessions');
    } catch (err) {
      console.error('Error creating session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Get available slots for selected day
  const availableSlots = [
    '09:00 AM - 09:45 AM',
    '10:00 AM - 10:45 AM',
    '11:30 AM - 12:15 PM',
    '02:00 PM - 02:45 PM',
    '04:00 PM - 04:45 PM',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 pt-2">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/mentor/sessions')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Mentoring Sessions
      </button>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
          <Calendar className="w-3.5 h-3.5" /> Session Booking Workflow
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Schedule 1-on-1 Mentorship</h1>
        <p className="text-slate-300 text-sm">
          Select student, date, time slot, and session agenda to issue calendar invite.
        </p>
      </div>

      {/* BOOKING FORM CARD */}
      <form onSubmit={handleSubmitBooking} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        {/* STEP 1: SELECT STUDENT */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 font-medium"
          >
            {students.map((st) => (
              <option key={st.studentId} value={st.studentId}>
                {st.name} — {st.currentStage} (Skill Score: {st.skillScore}%)
              </option>
            ))}
          </select>
        </div>

        {/* STEP 2: TOPIC & SESSION TYPE */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Mentoring Topic</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. HFT Strategy Review & Backtesting"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-medium"
            >
              {['1-on-1 Mentorship', 'Code Review', 'Career Guidance', 'Project Consultation'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 3: DATE & TIME SLOT */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Select Date</label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">4. Select Available Time Slot</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-medium"
            >
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 4: AGENDA & NOTES */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">5. Session Agenda</label>
          <textarea
            rows={4}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="List main agenda items for the session..."
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-sans"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate('/mentor/sessions')}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={CheckCircle2}
            isLoading={isSubmitting}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6"
          >
            Confirm Session Booking
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewSessionPage;
