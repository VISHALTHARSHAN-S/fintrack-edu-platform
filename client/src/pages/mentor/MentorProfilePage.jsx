import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Edit2,
  Save,
  X,
  Award,
  Star,
  BookOpen,
  Globe,
  Briefcase,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchMentorProfile, updateMentorProfileApi } from '../../services/mentorService';

const MentorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setIsLoading(true);
      const res = await fetchMentorProfile();
      if (isMounted) {
        setProfile(res);
        setFormData(res);
        setIsLoading(false);
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateMentorProfileApi(formData);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* HEADER BANNER WITH CREDIBILITY METRICS */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
              {profile.name.slice(0, 2)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
                <Badge variant="emerald" size="sm">Verified Mentor</Badge>
              </div>
              <p className="text-purple-200 text-xs font-semibold">{profile.designation} at {profile.company}</p>
              <p className="text-slate-300 text-xs">{profile.yearsOfExperience} Years Industry Experience</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            icon={isEditing ? X : Edit2}
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Mentor Profile'}
          </Button>
        </div>

        {/* CREDIBILITY CARDS */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rating
            </span>
            <p className="text-lg font-black text-amber-400 mt-1">{profile.credibility?.rating || 4.9} / 5.0</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300">Total Sessions</span>
            <p className="text-lg font-black text-white mt-1">{profile.credibility?.totalSessions || 124}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300">Students Mentored</span>
            <p className="text-lg font-black text-purple-300 mt-1">{profile.credibility?.studentsMentored || 48}</p>
          </div>
        </div>
      </div>

      {/* EDIT FORM OR VIEW DETAILS */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Edit Profile Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Designation</label>
              <input
                type="text"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Company</label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Years of Experience</label>
              <input
                type="number"
                value={formData.yearsOfExperience || 12}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Bio</label>
            <textarea
              rows={4}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl font-sans"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Save}
              isLoading={isSaving}
              className="bg-purple-700 hover:bg-purple-800 text-white"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Biography</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {profile.bio}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base">FinTech Skills & Core Competencies</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, i) => (
                <Badge key={i} variant="purple" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Featured Mentoring Topics</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {profile.sessionTopics?.map((topic, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs font-semibold text-purple-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfilePage;
