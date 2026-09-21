import React, { useState, useEffect } from 'react';
import {
  Sliders,
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
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadAvailability = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetchMentorAvailability();
        if (isMounted) setAvailability(res);
      } catch (requestError) {
        if (isMounted) setError(requestError.response?.data?.message || 'Unable to load your availability.');
      } finally {
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

  const handleDayFieldChange = (dayIndex, field, value) => {
    setAvailability((prev) => {
      const schedule = [...prev.weeklySchedule];
      schedule[dayIndex] = { ...schedule[dayIndex], [field]: value };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const handleSlotChange = (dayIndex, slotIndex, value) => {
    setAvailability((prev) => {
      const schedule = [...prev.weeklySchedule];
      const slots = [...schedule[dayIndex].slots];
      slots[slotIndex] = { ...slots[slotIndex], time: value };
      schedule[dayIndex] = { ...schedule[dayIndex], slots };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const addSlot = (dayIndex) => {
    setAvailability((prev) => {
      const schedule = [...prev.weeklySchedule];
      const day = schedule[dayIndex];
      const slots = [...(day.slots || [])];
      slots.push({
        slotId: `${day.day.toLowerCase()}_${Date.now()}`,
        time: `${day.startTime} - ${day.endTime}`,
        isBooked: false,
      });
      schedule[dayIndex] = { ...day, slots };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setAvailability((prev) => {
      const schedule = [...prev.weeklySchedule];
      const slots = schedule[dayIndex].slots.filter((_, index) => index !== slotIndex);
      schedule[dayIndex] = { ...schedule[dayIndex], slots };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const savedAvailability = await updateMentorAvailabilityApi(availability);
      setAvailability(savedAvailability);
      setSuccessMessage('Availability schedule saved successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your availability.');
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

  if (error && !availability) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
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

      {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-sm">{error}</div>}
      {successMessage && <div role="status" className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 text-sm">{successMessage}</div>}

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

                {dayItem.isEnabled && <span className="text-xs font-semibold text-purple-800">{dayItem.startTime} - {dayItem.endTime}</span>}
              </div>

              {dayItem.isEnabled && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500">Start time</span>
                    <input
                      value={dayItem.startTime || ''}
                      onChange={(event) => handleDayFieldChange(idx, 'startTime', event.target.value)}
                      placeholder="09:00 AM"
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500">End time</span>
                    <input
                      value={dayItem.endTime || ''}
                      onChange={(event) => handleDayFieldChange(idx, 'endTime', event.target.value)}
                      placeholder="05:00 PM"
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                    />
                  </label>
                </div>
              )}

              {/* SLOTS LIST */}
              {dayItem.isEnabled && (
                <div className="space-y-2 pt-2 border-t border-purple-100">
                  {(dayItem.slots || []).map((slot, slotIndex) => (
                    <div
                      key={slot.slotId}
                      className="flex items-center gap-2"
                    >
                      <input
                        value={slot.time || ''}
                        onChange={(event) => handleSlotChange(idx, slotIndex, event.target.value)}
                        placeholder="10:00 AM - 10:45 AM"
                        className="flex-1 p-2 text-xs border border-slate-200 rounded-lg font-mono"
                      />
                      <button type="button" onClick={() => removeSlot(idx, slotIndex)} className="p-2 text-slate-400 hover:text-red-600" aria-label={`Remove ${dayItem.day} slot`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" icon={Plus} onClick={() => addSlot(idx)}>Add slot</Button>
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
