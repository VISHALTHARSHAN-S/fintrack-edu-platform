import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Download,
  Save,
  Menu,
  X,
  Sparkles,
  Layers,
  Check,
  Video,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import Tabs from '../../components/common/Tabs';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchCourseById, markLessonComplete } from '../../services/courseService';
import { completeLesson, saveLessonNote } from '../../features/student/studentLearningSlice';

const StudentLearningPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { enrolledCourses, lessonNotes } = useSelector((state) => state.studentLearning);

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('notes');
  const [noteText, setNoteText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSavedToast, setIsSavedToast] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadCourse = async () => {
      setIsLoading(true);
      const data = await fetchCourseById(courseId);
      if (isMounted) {
        setCourse(data);
        setIsLoading(false);
      }
    };
    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (lessonId && lessonNotes[lessonId]) {
      setNoteText(lessonNotes[lessonId]);
    } else {
      setNoteText('');
    }
  }, [lessonId, lessonNotes]);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6 max-w-7xl mx-auto">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Course Content Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/student/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const cid = course._id || course.id;
  const enrollment = enrolledCourses.find((e) => e.courseId === cid || e.courseId?._id === cid);
  const completedLessons = enrollment?.completedLessons || [];

  // Flatten all lessons into array for navigation
  const allLessons = [];
  course.modules.forEach((mod) => {
    mod.lessons.forEach((l) => {
      allLessons.push({ ...l, moduleId: mod.moduleId, moduleTitle: mod.title });
    });
  });

  const currentIndex = allLessons.findIndex((l) => l.lessonId === lessonId);
  const currentLesson = allLessons[currentIndex] || allLessons[0];
  const isCurrentCompleted = completedLessons.includes(currentLesson.lessonId);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessonsCount = allLessons.length;
  const courseProgress = enrollment?.progressPercentage || 0;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleMarkComplete = () => {
    dispatch(
      completeLesson({
        courseId: cid,
        lessonId: currentLesson.lessonId,
        totalLessons: totalLessonsCount,
      })
    );
    markLessonComplete(cid, currentLesson.lessonId);
  };

  const handleSaveNote = () => {
    dispatch(saveLessonNote({ lessonId: currentLesson.lessonId, text: noteText }));
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BREADCRUMB & CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/student/courses/${cid}`)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Course Details"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-600">
              <span>{course.title}</span>
              <span>•</span>
              <span className="text-slate-500 truncate max-w-[200px]">{currentLesson.moduleTitle}</span>
            </div>
            <h1 className="text-base font-bold text-slate-900 truncate max-w-xl">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            variant={isCurrentCompleted ? 'secondary' : 'primary'}
            size="sm"
            icon={isCurrentCompleted ? CheckCircle2 : Check}
            onClick={handleMarkComplete}
            className={isCurrentCompleted ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'bg-emerald-600 hover:bg-emerald-700'}
          >
            {isCurrentCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT & SIDEBAR GRID */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: VIDEO PLAYER & LESSON TABBED CONTAINER */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all`}>
          {/* MEDIA CONTENT CONTAINER */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
            {currentLesson.type === 'video' && currentLesson.videoUrl ? (
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  className="w-full h-full object-contain"
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* PLAY OVERLAY BUTTON */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>
                )}

                {/* CUSTOM CONTROLS OVERLAY */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-white text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="hover:text-brand-400">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <button onClick={toggleMute} className="hover:text-brand-400">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <span className="text-slate-400 font-mono text-[11px]">{currentLesson.duration}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* SPEED CONTROLLER */}
                    <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                      {[1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            playbackSpeed === s ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-slate-200 bg-slate-900 space-y-4">
                <Badge variant="brand" size="sm">Reading & Interactive Module</Badge>
                <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed">
                  <p>{currentLesson.content}</p>
                </div>
              </div>
            )}
          </div>

          {/* PREVIOUS / NEXT NAVIGATION BAR */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={!prevLesson}
              onClick={() => prevLesson && navigate(`/student/learn/${cid}/${prevLesson.lessonId}`)}
            >
              Previous Lesson
            </Button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
              Lesson {currentIndex + 1} of {totalLessonsCount}
            </span>

            <Button
              variant="primary"
              size="sm"
              disabled={!nextLesson}
              onClick={() => nextLesson && navigate(`/student/learn/${cid}/${nextLesson.lessonId}`)}
            >
              Next Lesson <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* BOTTOM TABS: NOTES & RESOURCES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <Tabs
              tabs={[
                { id: 'notes', label: 'My Notes' },
                { id: 'resources', label: `Resources (${currentLesson.resources?.length || 0})` },
                { id: 'overview', label: 'Lesson Summary' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* TAB CONTENT: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    Write personal notes for this lesson. Notes are saved to your account.
                  </p>
                  {isSavedToast && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Take notes during this lesson... (e.g. Limit Order Book priority equations, Latency thresholds)"
                  rows={5}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" icon={Save} onClick={handleSaveNote}>
                    Save Notes
                  </Button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                {currentLesson.resources && currentLesson.resources.length > 0 ? (
                  currentLesson.resources.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{res.title}</p>
                          <span className="text-[10px] text-slate-400 uppercase">{res.type} Format</span>
                        </div>
                      </div>
                      <a
                        href={res.url}
                        onClick={(e) => e.preventDefault()}
                        className="p-2 rounded-xl text-brand-600 hover:bg-brand-50 transition-colors inline-flex items-center gap-1 text-xs font-medium"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No downloadable resources attached to this lesson.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <h4 className="font-bold text-slate-900 text-sm">About {currentLesson.title}</h4>
                <p>{currentLesson.content}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: COURSE PROGRESS & CURRICULUM SIDEBAR */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-6">
            {/* SIDEBAR HEADER & OVERALL PROGRESS */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Course Content</h3>
                <span className="text-xs font-bold text-brand-600">{courseProgress}%</span>
              </div>
              <ProgressBar value={courseProgress} variant={courseProgress >= 100 ? 'emerald' : 'brand'} size="sm" />
              <p className="text-[11px] text-slate-400">
                {completedLessons.length} of {totalLessonsCount} lessons completed
              </p>
            </div>

            {/* MODULE ACCORDIONS */}
            <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 no-scrollbar">
              {course.modules.map((module) => (
                <div key={module.moduleId} className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-xs px-1 text-slate-500 uppercase tracking-wider">
                    {module.title}
                  </h4>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.lessonId === lessonId;
                      const isDone = completedLessons.includes(lesson.lessonId);

                      return (
                        <div
                          key={lesson.lessonId}
                          onClick={() => navigate(`/student/learn/${cid}/${lesson.lessonId}`)}
                          className={`p-3 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                              : isDone
                              ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {isDone ? (
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                            ) : (
                              <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className={`text-[10px] shrink-0 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {lesson.duration}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLearningPlayer;
