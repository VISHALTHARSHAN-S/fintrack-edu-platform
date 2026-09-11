import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchMentorAvailability, updateMentorAvailabilityApi } from '../../services/mentorService';

const MentorAvailabilityPage = () => {
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAvailability = async () => {
      setIsLoading(true);
      const res = await fetchMentorAvailability();
      if (isMounted) {
        setAvailability(res);
        setIsLoading(false);
      }
    };
    loadAvailability();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleDay = (dayIndex) => {
    setAvailability((prev) => {
      const schedule = [...prev.weeklySchedule];
      schedule[dayIndex] = {
        ...schedule[dayIndex],
        isEnabled: !schedule[dayIndex].isEnabled,
      };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      await updateMentorAvailabilityApi(availability);
    } catch (err) {
      console.error('Error saving availability:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { weeklySchedule = [], sessionDurationMinutes, maxSessionsPerDay } = availability;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
          <Sliders className="w-3.5 h-3.5" /> Availability Schedule Manager
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Weekly Availability & Session Slots
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
          Configure available days, operating hours, session slot lengths, and daily booking limits used across the booking workflow.
        </p>
      </div>

      {/* SESSION PARAMETERS CARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Default Session Duration</label>
          <select
            value={sessionDurationMinutes}
            onChange={(e) => setAvailability({ ...availability, sessionDurationMinutes: Number(e.target.value) })}
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-semibold"
          >
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes (Recommended)</option>
            <option value={60}>60 Minutes</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Max Sessions Allowed Per Day</label>
          <select
            value={maxSessionsPerDay}
            onChange={(e) => setAvailability({ ...availability, maxSessionsPerDay: Number(e.target.value) })}
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-semibold"
          >
            <option value={2}>2 Sessions</option>
            <option value={4}>4 Sessions (Recommended)</option>
            <option value={6}>6 Sessions</option>
          </select>
        </div>
      </div>

      {/* WEEKLY SCHEDULE SETTINGS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Weekly Working Days & Time Slots
        </h3>

        <div className="space-y-4">
          {weeklySchedule.map((dayItem, idx) => (
            <div
              key={dayItem.day}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                dayItem.isEnabled
                  ? 'bg-purple-50/30 border-purple-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dayItem.isEnabled}
                    onChange={() => handleToggleDay(idx)}
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 text-sm">{dayItem.day}</span>
                  <Badge variant={dayItem.isEnabled ? 'purple' : 'slate'} size="xs">
                    {dayItem.isEnabled ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>

                {dayItem.isEnabled && (
                  <span className="text-xs font-semibold text-purple-800">
                    {dayItem.startTime} - {dayItem.endTime}
                  </span>
                )}
              </div>

              {/* SLOTS LIST */}
              {dayItem.isEnabled && dayItem.slots?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
                  {dayItem.slots.map((slot) => (
                    <span
                      key={slot.slotId}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border ${
                        slot.isBooked
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-white border-purple-200 text-purple-900'
                      }`}
                    >
                      {slot.time} {slot.isBooked && '(Booked)'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SAVE AVAILABILITY BUTTON */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            variant="primary"
            size="md"
            icon={Save}
            isLoading={isSaving}
            onClick={handleSaveAvailability}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-8"
          >
            Save Availability Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorAvailabilityPage;
