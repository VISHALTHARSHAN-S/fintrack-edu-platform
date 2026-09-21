import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Clock3, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import { bookMentorSession, getMentorAvailability, getMentorProfile } from '../../../services/studentMentorService';

const sessionTypes = ['1-on-1 Mentorship', 'Code Review', 'Career Guidance', 'Project Consultation'];

const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const StudentMentorBookingPage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [date, setDate] = useState(getTomorrow);
  const [timeSlot, setTimeSlot] = useState('');
  const [sessionType, setSessionType] = useState(sessionTypes[0]);
  const [topic, setTopic] = useState('');
  const [studentMessage, setStudentMessage] = useState('');
  const [isMentorLoading, setIsMentorLoading] = useState(true);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getMentorProfile(mentorId)
      .then((profile) => { if (isMounted) setMentor(profile); })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load mentor information.'); })
      .finally(() => { if (isMounted) setIsMentorLoading(false); });
    return () => { isMounted = false; };
  }, [mentorId]);

  useEffect(() => {
    if (!date) return undefined;
    let isMounted = true;
    setIsAvailabilityLoading(true);
    setAvailability(null);
    setTimeSlot('');
    setError('');
    getMentorAvailability(mentorId, date)
      .then((data) => { if (isMounted) setAvailability(data); })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load available slots.'); })
      .finally(() => { if (isMounted) setIsAvailabilityLoading(false); });
    return () => { isMounted = false; };
  }, [mentorId, date]);

  const availableSlots = availability?.slots || [];
  const selectedSlot = availableSlots.find((slot) => slot.time === timeSlot);
  const initials = useMemo(() => mentor?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), [mentor]);

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!selectedSlot?.isAvailable || !topic.trim()) return;
    setIsBooking(true);
    setError('');
    try {
      const response = await bookMentorSession(mentorId, {
        date,
        timeSlot,
        sessionType,
        topic: topic.trim(),
        studentMessage: studentMessage.trim(),
      });
      setBooking(response.data.session);
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 409) {
        setError('This slot was just booked by another student. Please select another slot.');
        const refreshedAvailability = await getMentorAvailability(mentorId, date).catch(() => null);
        if (refreshedAvailability) {
          setAvailability(refreshedAvailability);
          setTimeSlot('');
        }
      } else {
        setError(requestError.response?.data?.message || 'Unable to book this session. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isMentorLoading) return <div className="max-w-4xl mx-auto space-y-6"><p className="text-sm text-slate-500">Loading mentor information...</p><CardSkeleton /><CardSkeleton /></div>;
  if (!mentor) return <EmptyState title="Mentor not found" description={error || 'This mentor is not available for booking.'} actionText="Back to Mentors" onAction={() => navigate('/student/mentors')} />;

  if (booking) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <section className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-extrabold text-slate-900 mt-4">Mentorship session booked successfully.</h1>
          <p className="text-sm text-slate-500 mt-2">Your session with {mentor.name} is confirmed.</p>
          <div className="text-left bg-slate-50 rounded-2xl p-5 mt-6 space-y-3 text-sm">
            <p><strong className="text-slate-700">Mentor:</strong> {mentor.name}</p>
            <p><strong className="text-slate-700">Date:</strong> {new Date(`${date}T00:00:00`).toLocaleDateString()}</p>
            <p><strong className="text-slate-700">Time:</strong> {timeSlot}</p>
            <p><strong className="text-slate-700">Topic:</strong> {booking.topic}</p>
            <p><strong className="text-slate-700">Duration:</strong> {booking.durationMinutes} minutes</p>
          </div>
          <Button className="mt-6" onClick={() => navigate('/student/mentor-sessions')}>View My Sessions</Button>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/student/mentors/${mentorId}`)}>Back to Profile</Button>
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {mentor.avatar ? <img src={mentor.avatar} alt={mentor.name} className="w-16 h-16 rounded-2xl object-cover" /> : <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-lg font-bold">{initials || <UserRound />}</div>}
          <div><h1 className="text-2xl font-extrabold text-slate-900">Book a Session</h1><p className="text-sm text-slate-600 mt-1">{mentor.name}{mentor.designation ? `, ${mentor.designation}` : ''}</p></div>
        </div>
      </section>

      <form onSubmit={handleBooking} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        {error && <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span></div>}
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="space-y-2"><span className="text-xs font-bold text-slate-700">Session type</span><select value={sessionType} onChange={(event) => setSessionType(event.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-white"><option value={sessionTypes[0]}>{sessionTypes[0]}</option>{sessionTypes.slice(1).map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="space-y-2"><span className="text-xs font-bold text-slate-700">Date</span><span className="relative block"><CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input required type="date" min={getTomorrow()} value={date} onChange={(event) => setDate(event.target.value)} className="w-full pl-10 p-2.5 text-sm border border-slate-200 rounded-xl" /></span></label>
        </div>

        <div className="space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Available slots</span>{availability?.durationMinutes && <span className="text-xs text-slate-500 inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {availability.durationMinutes} minutes</span>}</div>
          {isAvailabilityLoading ? <p className="text-sm text-slate-500">Loading available slots...</p> : availableSlots.length === 0 ? <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">No available slots for this date.</p> : <div className="grid sm:grid-cols-2 gap-3">{availableSlots.map((slot) => <button type="button" key={slot.slotId} disabled={!slot.isAvailable} onClick={() => setTimeSlot(slot.time)} className={`p-3 rounded-xl border text-sm text-left transition-colors ${slot.isAvailable ? timeSlot === slot.time ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 hover:border-brand-400' : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed line-through'}`}>{slot.time}{!slot.isAvailable && <span className="block text-xs no-underline">Unavailable</span>}</button>)}</div>}
        </div>

        <label className="space-y-2 block"><span className="text-xs font-bold text-slate-700">Topic</span><input required value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="What would you like help with?" className="w-full p-2.5 text-sm border border-slate-200 rounded-xl" /></label>
        <label className="space-y-2 block"><span className="text-xs font-bold text-slate-700">Student message <span className="font-normal text-slate-400">(optional)</span></span><textarea value={studentMessage} onChange={(event) => setStudentMessage(event.target.value)} placeholder="Share any context with your mentor..." rows="4" className="w-full p-2.5 text-sm border border-slate-200 rounded-xl resize-y" /></label>

        <div className="border-t border-slate-100 pt-5 space-y-3"><h2 className="font-bold text-slate-900">Booking summary</h2><div className="bg-slate-50 rounded-2xl p-4 text-sm space-y-2"><p><strong>Mentor:</strong> {mentor.name}</p><p><strong>Date:</strong> {date ? new Date(`${date}T00:00:00`).toLocaleDateString() : 'Select a date'}</p><p><strong>Time:</strong> {timeSlot || 'Select an available slot'}</p><p><strong>Duration:</strong> {availability?.durationMinutes ? `${availability.durationMinutes} minutes` : 'Configured by mentor'}</p><p><strong>Topic:</strong> {topic || 'Add a topic'}</p></div><Button type="submit" isLoading={isBooking} isDisabled={!selectedSlot?.isAvailable || !topic.trim()} fullWidth>Confirm Booking</Button></div>
      </form>
    </div>
  );
};

export default StudentMentorBookingPage;