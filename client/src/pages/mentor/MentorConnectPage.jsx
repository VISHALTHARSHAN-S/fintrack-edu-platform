import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Sparkles,
  Award,
  Users,
  Eye,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { fetchMentorConnectWorkspace, updateMentorshipRequestApi } from '../../services/mentorService';

const MentorConnectPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadConnect = async () => {
      setIsLoading(true);
      const res = await fetchMentorConnectWorkspace();
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    };
    loadConnect();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRequestAction = async (requestId, action) => {
    setActioningId(requestId);
    try {
      await updateMentorshipRequestApi(requestId, action);
      setData((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter((r) => r.requestId !== requestId),
      }));
    } catch (err) {
      console.error('Error updating request:', err);
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { pendingRequests = [], activeMentorships = [], recommendedStudents = [] } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Mentor Connect Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mentorship Requests & Matching
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Review incoming student mentorship connection requests, view active mentorship pairs, and discover high-potential cohort candidates.
          </p>
        </div>
      </div>

      {/* PENDING STUDENT REQUESTS SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Pending Student Requests ({pendingRequests.length})
          </h3>
        </div>

        {pendingRequests.length === 0 ? (
          <EmptyState title="No Pending Requests" description="You have responded to all incoming mentorship requests." />
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-100/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{req.studentName}</h4>
                      <Badge variant="purple" size="xs">Skill Score: {req.studentSkillScore}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{req.studentCourse}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Requested {new Date(req.requestedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-purple-100">
                  "{req.requestMessage}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {req.interests?.map((interest, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                        {interest}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      disabled={actioningId === req.requestId}
                      onClick={() => handleRequestAction(req.requestId, 'decline')}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      disabled={actioningId === req.requestId}
                      onClick={() => handleRequestAction(req.requestId, 'accept')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Accept Mentorship
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECOMMENDED STUDENTS & ACTIVE MENTORSHIPS GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* RECOMMENDED HIGH-PERFORMING STUDENTS */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" /> Recommended Cohort Candidates
          </h3>
          <div className="space-y-3">
            {recommendedStudents.map((rec) => (
              <div key={rec.studentId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{rec.name}</h5>
                    <p className="text-xs text-slate-500">{rec.course}</p>
                  </div>
                  <Badge variant="emerald" size="sm">{rec.skillScore}</Badge>
                </div>
                <p className="text-xs text-slate-600 italic">"{rec.reason}"</p>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => navigate('/mentor/messages')}
                  >
                    Initiate Connection
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE MENTORSHIPS PAIRS */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-700" /> Active Mentorships ({activeMentorships.length})
          </h3>
          <div className="space-y-3">
            {activeMentorships.map((act) => (
              <div key={act.studentId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{act.name}</h5>
                  <p className="text-xs text-slate-500">{act.currentStage} • Progress {act.courseProgress}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/mentor/students/${act.studentId}`)}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Calendar}
                    onClick={() => navigate('/mentor/sessions/new')}
                    className="bg-purple-700 hover:bg-purple-800 text-white"
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorConnectPage;
