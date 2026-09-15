import { LiveClass } from '../models/LiveClass.js';
import { LiveClassAttendance } from '../models/LiveClassAttendance.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';

const demoAttendanceStore = new Map();

export const getClassWindowState = (liveClass, currentDate = new Date()) => {
  const scheduledAt = new Date(liveClass.scheduledAt);
  const durationMs = Number(liveClass.durationMinutes || 60) * 60 * 1000;
  const joinWindowStart = new Date(scheduledAt.getTime() - 10 * 60 * 1000);
  const classEndAt = new Date(scheduledAt.getTime() + durationMs);

  if (liveClass.status === 'cancelled') {
    return {
      label: 'CANCELLED',
      text: 'Class cancelled',
      joinAllowed: false,
      status: 'cancelled',
      isLive: false,
      isStartingSoon: false,
      isCompleted: false,
    };
  }

  if (currentDate < joinWindowStart) {
    return {
      label: 'STARTING SOON',
      text: 'Class not open for joining yet',
      joinAllowed: false,
      status: 'scheduled',
      isLive: false,
      isStartingSoon: true,
      isCompleted: false,
    };
  }

  if (currentDate >= joinWindowStart && currentDate < scheduledAt) {
    return {
      label: 'STARTING SOON',
      text: 'Join window is open',
      joinAllowed: true,
      status: 'scheduled',
      isLive: false,
      isStartingSoon: true,
      isCompleted: false,
    };
  }

  if (currentDate >= scheduledAt && currentDate <= classEndAt) {
    return {
      label: 'LIVE NOW',
      text: 'Class is live',
      joinAllowed: true,
      status: 'live',
      isLive: true,
      isStartingSoon: false,
      isCompleted: false,
    };
  }

  return {
    label: 'COMPLETED',
    text: 'Session completed',
    joinAllowed: false,
    status: 'completed',
    isLive: false,
    isStartingSoon: false,
    isCompleted: true,
  };
};

export const buildDemoLiveClasses = () => {
  const now = new Date();

  return [
    {
      _id: 'demo_live_1',
      title: 'Live Q&A: Building HFT Bots in C++',
      description: 'A focused live discussion on building a latency-aware high-frequency trading strategy with C++ and real-world execution constraints.',
      courseId: 'demo_course_1',
      mentorId: 'demo_mentor_1',
      mentor: { _id: 'demo_mentor_1', name: 'Dr. Aris Vance', email: 'mentor@fintrack.edu', avatar: '' },
      course: { _id: 'demo_course_1', title: 'Financial Machine Learning & Risk Modeling', category: 'Financial AI & Analytics' },
      scheduledAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
      durationMinutes: 90,
      meetingLink: 'https://meet.google.com/fintrack-hft-live',
      recordingUrl: '',
      status: 'live',
      maxParticipants: 150,
      materials: [
        { title: 'Lecture Slides', url: 'https://example.com/slides/hft-bots.pdf', type: 'pdf' },
        { title: 'C++ HFT Notes', url: 'https://example.com/notes/market-microstructure.md', type: 'text' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'demo_live_2',
      title: 'Financial ML & Risk Modeling',
      description: 'An interactive lecture on model validation, default risk scoring, and governance-ready machine learning pipelines.',
      courseId: 'demo_course_2',
      mentorId: 'demo_mentor_2',
      mentor: { _id: 'demo_mentor_2', name: 'Dr. Aris Vance', email: 'mentor@fintrack.edu', avatar: '' },
      course: { _id: 'demo_course_2', title: 'Financial Machine Learning & Risk Modeling', category: 'Financial AI & Analytics' },
      scheduledAt: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/fintrack-finml-live',
      recordingUrl: '',
      status: 'scheduled',
      maxParticipants: 120,
      materials: [
        { title: 'Risk Model Overview', url: 'https://example.com/slides/risk-model.pdf', type: 'pdf' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'demo_live_3',
      title: 'Regulatory Reporting & API Integration',
      description: 'Review of SOX controls, regulatory reporting workflows, and ISO 20022 transaction integrations.',
      courseId: 'demo_course_3',
      mentorId: 'demo_mentor_3',
      mentor: { _id: 'demo_mentor_3', name: 'Elena Rostova', email: 'mentor2@fintrack.edu', avatar: '' },
      course: { _id: 'demo_course_3', title: 'RegTech Compliance & AML Systems', category: 'RegTech & Compliance' },
      scheduledAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 75,
      meetingLink: 'https://meet.google.com/fintrack-regtech-live',
      recordingUrl: 'https://example.com/recordings/regtech-reporting.mp4',
      status: 'completed',
      maxParticipants: 100,
      materials: [
        { title: 'Regulatory Checklist', url: 'https://example.com/files/regulatory-checklist.pdf', type: 'pdf' },
        { title: 'API Integration Notes', url: 'https://example.com/files/api-integration.md', type: 'text' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const normalizeLiveClassData = async (liveClass) => {
  const rawCourse = liveClass.courseId && typeof liveClass.courseId === 'object' ? liveClass.courseId : null;
  const rawMentor = liveClass.mentorId && typeof liveClass.mentorId === 'object' ? liveClass.mentorId : null;

  const course = rawCourse || {
    _id: liveClass.courseId || 'demo_course',
    title: liveClass.courseName || 'FinTech Learning Session',
    category: liveClass.courseCategory || 'Finance',
  };

  const mentor = rawMentor || {
    _id: liveClass.mentorId || 'demo_mentor',
    name: liveClass.mentorName || 'Industry Mentor',
    avatar: '',
  };

  const classState = getClassWindowState(liveClass);

  return {
    ...liveClass.toObject ? liveClass.toObject() : liveClass,
    course,
    mentor,
    meetingLink: liveClass.meetingLink || 'https://meet.google.com/fintrack-live',
    statusLabel: classState.label,
    currentState: classState,
    joinAllowed: classState.joinAllowed,
  };
};

export const findClassById = async (classId, isDbConnected = false) => {
  if (isDbConnected) {
    const classFromDb = await LiveClass.findById(classId).populate('courseId').populate('mentorId', 'name email avatar');
    if (classFromDb) {
      return classFromDb;
    }
  }

  return buildDemoLiveClasses().find((item) => item._id === classId || item._id === String(classId)) || null;
};

export const listStudentLiveClasses = async (studentId, isDbConnected = false) => {
  if (isDbConnected) {
    const classes = await LiveClass.find({ status: { $ne: 'cancelled' } })
      .populate('courseId')
      .populate('mentorId', 'name email avatar')
      .sort({ scheduledAt: 1 });

    if (classes.length > 0) {
      return Promise.all(classes.map((item) => normalizeLiveClassData(item)));
    }
  }

  return buildDemoLiveClasses().map((item) => ({
    ...item,
    course: item.course,
    mentor: item.mentor,
    statusLabel: getClassWindowState(item).label,
    currentState: getClassWindowState(item),
    joinAllowed: getClassWindowState(item).joinAllowed,
  }));
};

export const getLiveClassDetail = async (classId, isDbConnected = false) => {
  const foundClass = await findClassById(classId, isDbConnected);

  if (!foundClass) {
    return null;
  }

  if (isDbConnected) {
    return await normalizeLiveClassData(foundClass);
  }

  return {
    ...foundClass,
    course: foundClass.course,
    mentor: foundClass.mentor,
    statusLabel: getClassWindowState(foundClass).label,
    currentState: getClassWindowState(foundClass),
    joinAllowed: getClassWindowState(foundClass).joinAllowed,
  };
};

export const joinLiveClassForStudent = async (studentId, classId, isDbConnected = false) => {
  const liveClass = await findClassById(classId, isDbConnected);

  if (!liveClass) {
    return { success: false, message: 'Live class not found' };
  }

  if (liveClass.status === 'cancelled') {
    return { success: false, message: 'This live class has been cancelled.' };
  }

  const state = getClassWindowState(liveClass);
  if (!state.joinAllowed) {
    return {
      success: false,
      message: 'Joining is only available from 10 minutes before the class starts until the session ends.',
    };
  }

  if (isDbConnected) {
    const record = await LiveClassAttendance.findOneAndUpdate(
      { liveClassId: classId, studentId },
      {
        liveClassId: classId,
        studentId,
        joinedAt: new Date(),
        leftAt: null,
        durationMinutes: 0,
        attended: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return {
      success: true,
      message: 'Joined live class successfully.',
      data: {
        liveClassId: classId,
        meetingLink: liveClass.meetingLink,
        attendance: record,
      },
    };
  }

  const key = `${String(classId)}:${String(studentId)}`;
  const record = demoAttendanceStore.get(key) || {
    liveClassId: classId,
    studentId,
    joinedAt: null,
    leftAt: null,
    durationMinutes: 0,
    attended: false,
  };

  const joinedAt = new Date();
  const nextRecord = { ...record, joinedAt, leftAt: null, durationMinutes: 0, attended: true };
  demoAttendanceStore.set(key, nextRecord);

  return {
    success: true,
    message: 'Joined live class successfully.',
    data: {
      liveClassId: classId,
      meetingLink: liveClass.meetingLink,
      attendance: nextRecord,
    },
  };
};

export const leaveLiveClassForStudent = async (studentId, classId, isDbConnected = false) => {
  if (isDbConnected) {
    const record = await LiveClassAttendance.findOne({ liveClassId: classId, studentId });

    if (!record) {
      return { success: false, message: 'No join record found for this student and class.' };
    }

    const leftAt = new Date();
    const joinedAt = record.joinedAt ? new Date(record.joinedAt) : leftAt;
    const durationMinutes = Math.max(0, Math.round((leftAt.getTime() - joinedAt.getTime()) / 60000));

    record.leftAt = leftAt;
    record.durationMinutes = durationMinutes;
    record.attended = false;
    await record.save();

    return {
      success: true,
      message: 'You have left the live class.',
      data: record,
    };
  }

  const key = `${String(classId)}:${String(studentId)}`;
  const record = demoAttendanceStore.get(key);

  if (!record) {
    return { success: false, message: 'No join record found for this student and class.' };
  }

  const leftAt = new Date();
  const joinedAt = record.joinedAt ? new Date(record.joinedAt) : leftAt;
  const durationMinutes = Math.max(0, Math.round((leftAt.getTime() - joinedAt.getTime()) / 60000));

  const nextRecord = {
    ...record,
    leftAt,
    durationMinutes,
    attended: false,
  };
  demoAttendanceStore.set(key, nextRecord);

  return {
    success: true,
    message: 'You have left the live class.',
    data: nextRecord,
  };
};

export const getRecordingForClass = async (classId, isDbConnected = false) => {
  const liveClass = await findClassById(classId, isDbConnected);

  if (!liveClass) {
    return { success: false, message: 'Live class not found' };
  }

  if (!liveClass.recordingUrl) {
    return {
      success: true,
      data: {
        available: false,
        message: 'Recording will be available after the mentor uploads it.',
      },
    };
  }

  return {
    success: true,
    data: {
      available: true,
      recordingUrl: liveClass.recordingUrl,
      title: liveClass.title,
    },
  };
};
