import { randomBytes, randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { Certificate } from '../models/Certificate.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { SEEDED_ASSESSMENTS } from '../seed/practiceSeedData.js';
import { createUserNotification } from '../services/notificationService.js';

const ISSUING_ORGANIZATION = 'FinTrack Edu';

const requireDatabase = (req, res) => {
  if (!req.isDbConnected) {
    res.status(503).json({
      success: false,
      message: 'Certificate services require a connected database.',
    });
    return false;
  }
  return true;
};

const getCourseLessonIds = (course) =>
  new Set((course.modules || []).flatMap((module) => module.lessons.map((lesson) => lesson.lessonId)));

const getCompletionState = (enrollment, course) => {
  const lessonIds = getCourseLessonIds(course);
  const completedLessonIds = new Set(enrollment.completedLessons || []);
  const allLessonsCompleted =
    lessonIds.size > 0 &&
    completedLessonIds.size === lessonIds.size &&
    [...completedLessonIds].every((lessonId) => lessonIds.has(lessonId));

  return (
    enrollment.status === 'completed' &&
    enrollment.progressPercentage === 100 &&
    allLessonsCompleted
  );
};

const getAssessmentProgress = async (studentId, assessmentIds) => {
  if (assessmentIds.length === 0) return { passedAssessmentIds: [], missingAssessmentIds: [] };

  const assessmentDefinitions = new Map(
    SEEDED_ASSESSMENTS.map((assessment) => [assessment.assessmentId, assessment])
  );
  const attempts = await AssessmentAttempt.find({
    studentId,
    assessmentId: { $in: assessmentIds },
    status: 'completed',
    passStatus: 'PASSED',
  })
    .select('assessmentId percentage')
    .lean();
  const passedAssessmentIds = [
    ...new Set(
      attempts
        .filter((attempt) => {
          const assessment = assessmentDefinitions.get(attempt.assessmentId);
          return assessment && attempt.percentage >= assessment.passingPercentage;
        })
        .map((attempt) => attempt.assessmentId)
    ),
  ];

  return {
    passedAssessmentIds,
    missingAssessmentIds: assessmentIds.filter((id) => !passedAssessmentIds.includes(id)),
  };
};

export const listCertificates = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;

    const certificates = await Certificate.find({ studentId: req.user.id })
      .populate('courseId', 'title category')
      .sort({ issueDate: -1 })
      .lean();

    return res.json({ success: true, data: certificates });
  } catch (error) {
    console.error('[Certificate List Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load certificates.' });
  }
};

export const getEligibleCourses = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;

    const enrollments = await Enrollment.find({
      studentId: req.user.id,
      status: 'completed',
      progressPercentage: 100,
    }).populate('courseId', 'title requiredAssessmentIds modules');

    const completedEnrollments = enrollments.filter(
      (enrollment) =>
        enrollment.courseId && getCompletionState(enrollment, enrollment.courseId)
    );
    const courseIds = completedEnrollments.map((enrollment) => enrollment.courseId._id);
    const existingCertificates = await Certificate.find({
      studentId: req.user.id,
      courseId: { $in: courseIds },
    })
      .select('courseId')
      .lean();
    const issuedCourseIds = new Set(existingCertificates.map((certificate) => String(certificate.courseId)));

    const data = await Promise.all(
      completedEnrollments.map(async (enrollment) => {
        const course = enrollment.courseId;
        const requiredAssessmentIds = course.requiredAssessmentIds || [];
        const assessmentProgress = await getAssessmentProgress(req.user.id, requiredAssessmentIds);
        const alreadyIssued = issuedCourseIds.has(String(course._id));

        return {
          courseId: course._id,
          courseTitle: course.title,
          eligible: !alreadyIssued && assessmentProgress.missingAssessmentIds.length === 0,
          alreadyIssued,
          requiredAssessmentIds,
          missingAssessmentIds: assessmentProgress.missingAssessmentIds,
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error) {
    console.error('[Certificate Eligibility Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to check certificate eligibility.' });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;

    const { courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'A valid course ID is required.' });
    }

    const existingCertificate = await Certificate.findOne({
      studentId: req.user.id,
      courseId,
    }).populate('courseId', 'title category');

    if (existingCertificate) {
      await createUserNotification({
        userId: req.user.id,
        eventKey: `certificate:${existingCertificate._id}:issued`,
        title: 'Certificate earned',
        message: `Your certificate for ${existingCertificate.metadata.courseTitle} is ready.`,
        category: 'certificate',
        type: 'success',
        link: '/student/certificates',
      });
      return res.json({ success: true, data: existingCertificate, alreadyIssued: true });
    }

    const [enrollment, course, student] = await Promise.all([
      Enrollment.findOne({ studentId: req.user.id, courseId }),
      Course.findById(courseId),
      User.findById(req.user.id).select('name role'),
    ]);

    if (!student || student.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only active student accounts can earn certificates.' });
    }
    if (!course || !enrollment || !getCompletionState(enrollment, course)) {
      return res.status(409).json({
        success: false,
        message: 'Complete every lesson in this course before requesting a certificate.',
      });
    }

    const requiredAssessmentIds = course.requiredAssessmentIds || [];
    const assessmentProgress = await getAssessmentProgress(req.user.id, requiredAssessmentIds);
    if (assessmentProgress.missingAssessmentIds.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Pass the required course assessments before requesting a certificate.',
        missingAssessmentIds: assessmentProgress.missingAssessmentIds,
      });
    }

    const certificate = await Certificate.create({
      studentId: req.user.id,
      courseId: course._id,
      certificateNumber: `FTE-${new Date().getUTCFullYear()}-${randomBytes(6).toString('hex').toUpperCase()}`,
      verificationId: randomUUID(),
      issueDate: new Date(),
      status: 'valid',
      metadata: {
        studentName: student.name,
        courseTitle: course.title,
        issuingOrganization: ISSUING_ORGANIZATION,
        requiredAssessmentIds,
      },
    });

    await certificate.populate('courseId', 'title category');
    await createUserNotification({
      userId: req.user.id,
      eventKey: `certificate:${certificate._id}:issued`,
      title: 'Certificate earned',
      message: `Your certificate for ${course.title} is ready.`,
      category: 'certificate',
      type: 'success',
      link: '/student/certificates',
    });
    return res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    if (error?.code === 11000) {
      const certificate = await Certificate.findOne({
        studentId: req.user.id,
        courseId: req.params.courseId,
      }).populate('courseId', 'title category');
      if (certificate) return res.json({ success: true, data: certificate, alreadyIssued: true });
    }

    console.error('[Certificate Issue Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to issue the certificate.' });
  }
};

export const getCertificate = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const { certificateId } = req.params;
    if (!mongoose.isValidObjectId(certificateId)) {
      return res.status(400).json({ success: false, message: 'A valid certificate ID is required.' });
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,
      studentId: req.user.id,
    })
      .populate('courseId', 'title category')
      .lean();
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    return res.json({ success: true, data: certificate });
  } catch (error) {
    console.error('[Certificate Detail Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load this certificate.' });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const { certificateId } = req.params;
    if (!mongoose.isValidObjectId(certificateId)) {
      return res.status(400).json({ success: false, message: 'A valid certificate ID is required.' });
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,
      studentId: req.user.id,
    }).populate('courseId', 'title');
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    if (certificate.status !== 'valid') {
      return res.status(410).json({ success: false, message: 'This certificate has been revoked.' });
    }

    const appUrl = (process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const verificationUrl = `${appUrl}/verify/${encodeURIComponent(certificate.verificationId)}`;
    const qrCode = await QRCode.toDataURL(verificationUrl, { width: 160, margin: 1 });
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 48 });
    const issueDate = certificate.issueDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${certificate.certificateNumber}.pdf"`
    );
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    doc.rect(0, 0, pageWidth, pageHeight).fill('#f8fafc');
    doc.roundedRect(26, 26, pageWidth - 52, pageHeight - 52, 16)
      .lineWidth(3)
      .stroke('#17324d');
    doc.roundedRect(37, 37, pageWidth - 74, pageHeight - 74, 12)
      .lineWidth(1)
      .stroke('#b38b45');

    doc.fillColor('#17324d').font('Helvetica-Bold').fontSize(16)
      .text(certificate.metadata.issuingOrganization.toUpperCase(), 65, 72, { align: 'center' });
    doc.fillColor('#b38b45').font('Helvetica').fontSize(11)
      .text('CERTIFICATE OF COURSE COMPLETION', 65, 107, { align: 'center', characterSpacing: 2 });
    doc.moveTo(180, 132).lineTo(pageWidth - 180, 132).lineWidth(1).stroke('#d6b36a');

    doc.fillColor('#475569').font('Helvetica').fontSize(13)
      .text('This certificate is proudly presented to', 80, 157, { align: 'center' });
    doc.fillColor('#102a43').font('Times-Bold').fontSize(34)
      .text(certificate.metadata.studentName, 70, 185, { align: 'center' });
    doc.fillColor('#475569').font('Helvetica').fontSize(13)
      .text('for successfully completing', 80, 235, { align: 'center' });
    doc.fillColor('#17324d').font('Helvetica-Bold').fontSize(21)
      .text(certificate.metadata.courseTitle, 90, 265, {
        align: 'center',
        width: pageWidth - 180,
      });

    doc.fillColor('#334155').font('Helvetica').fontSize(11)
      .text(`Issued on ${issueDate}`, 75, 322, { align: 'center' });
    doc.fillColor('#17324d').font('Helvetica-Bold').fontSize(11)
      .text(`Certificate No. ${certificate.certificateNumber}`, 75, 343, { align: 'center' });

    const qrCodeImage = Buffer.from(qrCode.split(',')[1], 'base64');
    doc.image(qrCodeImage, pageWidth - 135, pageHeight - 140, { width: 76, height: 76 });
    doc.fillColor('#64748b').font('Helvetica').fontSize(8)
      .text('Scan to verify', pageWidth - 145, pageHeight - 58, { width: 96, align: 'center' });
    doc.fillColor('#64748b').font('Helvetica').fontSize(9)
      .text('Verify this credential at the QR code shown.', 70, pageHeight - 74);
    doc.end();
  } catch (error) {
    console.error('[Certificate PDF Error]', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Unable to generate the certificate PDF.' });
    }
    return res.end();
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const certificate = await Certificate.findOne({
      verificationId: req.params.verificationId,
    })
      .populate('courseId', 'title')
      .lean();

    if (!certificate) {
      return res.json({ success: true, data: { status: 'not-found' } });
    }

    return res.json({
      success: true,
      data: {
        status: certificate.status === 'valid' ? 'valid' : 'revoked',
        certificateNumber: certificate.certificateNumber,
        courseTitle: certificate.metadata.courseTitle || certificate.courseId?.title,
        issuingOrganization: certificate.metadata.issuingOrganization,
        issueDate: certificate.issueDate,
      },
    });
  } catch (error) {
    console.error('[Certificate Verification Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to verify this certificate.' });
  }
};
