import { Enrollment } from '../models/Enrollment.js';
import { Wishlist } from '../models/Wishlist.js';
import { Course } from '../models/Course.js';
import { SEEDED_COURSES } from '../seed/coursesSeedData.js';

export const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    if (req.isDbConnected) {
      const enrollments = await Enrollment.find({ studentId }).populate('courseId');
      return res.json({ success: true, data: enrollments });
    }

    // Demo mock fallback
    const mockEnrollments = [
      {
        _id: 'enr_1',
        studentId,
        courseId: SEEDED_COURSES[0],
        progressPercentage: 78,
        completedLessons: ['l101', 'l102'],
        lastAccessedLessonId: 'l103',
        status: 'in-progress',
        lastAccessedAt: new Date(),
      },
      {
        _id: 'enr_2',
        studentId,
        courseId: SEEDED_COURSES[1],
        progressPercentage: 45,
        completedLessons: ['l401'],
        lastAccessedLessonId: 'l402',
        status: 'in-progress',
        lastAccessedAt: new Date(Date.now() - 86400000),
      },
      {
        _id: 'enr_3',
        studentId,
        courseId: SEEDED_COURSES[2],
        progressPercentage: 100,
        completedLessons: ['l501', 'l502'],
        lastAccessedLessonId: 'l502',
        status: 'completed',
        lastAccessedAt: new Date(Date.now() - 86400000 * 3),
      },
    ];

    return res.json({ success: true, data: mockEnrollments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (req.isDbConnected) {
      let enrollment = await Enrollment.findOne({ studentId, courseId });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          studentId,
          courseId,
          progressPercentage: 0,
          completedLessons: [],
          status: 'in-progress',
        });
      }
      return res.json({ success: true, data: enrollment });
    }

    return res.json({
      success: true,
      data: {
        _id: `enr_${Date.now()}`,
        studentId,
        courseId,
        progressPercentage: 0,
        completedLessons: [],
        status: 'in-progress',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markLessonComplete = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lessonId } = req.params;

    if (req.isDbConnected) {
      let enrollment = await Enrollment.findOne({ studentId, courseId });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          studentId,
          courseId,
          completedLessons: [lessonId],
          lastAccessedLessonId: lessonId,
        });
      } else {
        if (!enrollment.completedLessons.includes(lessonId)) {
          enrollment.completedLessons.push(lessonId);
        }
        enrollment.lastAccessedLessonId = lessonId;
        enrollment.lastAccessedAt = new Date();

        // Calculate progress percentage
        const course = await Course.findById(courseId);
        if (course) {
          const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          enrollment.progressPercentage = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;
          if (enrollment.progressPercentage >= 100) {
            enrollment.status = 'completed';
          }
        }
        await enrollment.save();
      }

      return res.json({ success: true, data: enrollment });
    }

    return res.json({
      success: true,
      message: 'Lesson completed successfully',
      lessonId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const studentId = req.user.id;

    if (req.isDbConnected) {
      const wishlist = await Wishlist.findOne({ studentId }).populate('courses');
      return res.json({ success: true, data: wishlist ? wishlist.courses : [] });
    }

    return res.json({
      success: true,
      data: [SEEDED_COURSES[1]._id, SEEDED_COURSES[3]._id],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (req.isDbConnected) {
      let wishlist = await Wishlist.findOne({ studentId });
      if (!wishlist) {
        wishlist = await Wishlist.create({ studentId, courses: [courseId] });
      } else {
        const index = wishlist.courses.indexOf(courseId);
        if (index > -1) {
          wishlist.courses.splice(index, 1);
        } else {
          wishlist.courses.push(courseId);
        }
        await wishlist.save();
      }
      return res.json({ success: true, data: wishlist.courses });
    }

    return res.json({
      success: true,
      message: 'Wishlist updated',
      courseId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentProgressStats = async (req, res) => {
  try {
    const data = {
      overallProgress: 72,
      learningStreak: '15 days',
      hoursLearned: '34.5 hrs',
      coursesCompleted: 5,
      coursesEnrolled: 12,
      weeklyActivity: [
        { day: 'Mon', hours: 2.5 },
        { day: 'Tue', hours: 4.0 },
        { day: 'Wed', hours: 1.5 },
        { day: 'Thu', hours: 3.5 },
        { day: 'Fri', hours: 5.0 },
        { day: 'Sat', hours: 2.0 },
        { day: 'Sun', hours: 3.0 },
      ],
      skillDistribution: [
        { skill: 'Quantitative Trading', score: 85 },
        { skill: 'DeFi & Smart Contracts', score: 92 },
        { skill: 'Financial Machine Learning', score: 78 },
        { skill: 'RegTech & Compliance', score: 88 },
        { skill: 'Digital Payments', score: 90 },
      ],
    };

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
