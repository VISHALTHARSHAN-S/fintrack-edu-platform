import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Certificate } from '../models/Certificate.js';
import { Interview } from '../models/Interview.js';
import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { SkillPassport } from '../models/SkillPassport.js';
import { User } from '../models/User.js';
import { buildStudentSkillTracker } from '../services/studentSkillService.js';
import { createUserNotification } from '../services/notificationService.js';

const requireDatabase = (req, res) => {
  if (!req.isDbConnected) {
    res.status(503).json({ success: false, message: 'Career services require a connected database.' });
    return false;
  }
  return true;
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isOpenJob = (job, now = new Date()) =>
  job.status === 'ACTIVE' && job.applicationDeadline && new Date(job.applicationDeadline) >= now;

const getCareerContext = async (studentId) => {
  const [user, profile, passport, certificates, tracker] = await Promise.all([
    User.findById(studentId).select('name email role status').lean(),
    CandidateProfile.findOne({ studentId: String(studentId) }).lean(),
    SkillPassport.findOne({ studentId: String(studentId) }).select('projects verifiedSkills').lean(),
    Certificate.find({ studentId, status: 'valid' })
      .populate('courseId', 'title category')
      .select('courseId issueDate metadata verificationId')
      .lean(),
    buildStudentSkillTracker(studentId),
  ]);
  if (!user || user.role !== 'student' || user.status !== 'active') {
    const error = new Error('Active student account not found.');
    error.status = 403;
    throw error;
  }

  const actualSkills = [
    ...(profile?.skills || []),
    ...tracker.skills.filter((skill) => skill.assessed).map((skill) => skill.name),
    ...(passport?.verifiedSkills || [])
      .filter((skill) => Number.isFinite(skill.proficiency))
      .map((skill) => skill.skill),
    ...(passport?.projects || []).flatMap((project) => project.techStack || []),
    ...certificates.map((certificate) => certificate.metadata?.courseTitle || certificate.courseId?.title),
  ].filter(Boolean);

  return { user, profile, passport, certificates, tracker, actualSkills };
};

export const calculateJobMatch = (job, actualSkills) => {
  const requiredSkills = [...new Set((job.requiredSkills || []).filter((skill) => skill?.trim()))];
  const skillLookup = new Set(actualSkills.map(normalize));
  const matchedSkills = requiredSkills.filter((skill) => skillLookup.has(normalize(skill)));
  const missingSkills = requiredSkills.filter((skill) => !skillLookup.has(normalize(skill)));
  return {
    matchPercentage: requiredSkills.length
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : null,
    matchedSkills,
    missingSkills,
    requiredSkills,
  };
};

const serializeProfile = (context) => ({
  name: context.user.name,
  email: context.user.email,
  education: context.profile?.education || '',
  experience: context.profile?.experience || '',
  careerObjective: context.profile?.careerObjective || '',
  availability: context.profile?.availability || '',
  location: context.profile?.location || '',
  preferredRoles: context.profile?.preferredRoles || [],
  preferredLocations: context.profile?.preferredLocations || [],
  workModePreference: context.profile?.workModePreference || '',
  skills: [...new Set(context.actualSkills)],
  profileSkills: context.profile?.skills || [],
  resumeUrl: context.profile?.resumeUrl || '',
  projects: (context.passport?.projects || []).map((project) => ({
    title: project.title,
    description: project.description || '',
    techStack: project.techStack || [],
    githubUrl: project.githubUrl || '',
  })),
  certificates: context.certificates.map((certificate) => ({
    title: certificate.metadata?.courseTitle || certificate.courseId?.title || 'Course certificate',
    issuer: certificate.metadata?.issuingOrganization || 'FinTrack Edu',
    issueDate: certificate.issueDate,
    verificationUrl: `/verify/${certificate.verificationId}`,
  })),
});

const buildJobCard = (job, actualSkills, applicationsByJob = new Map()) => {
  const match = calculateJobMatch(job, actualSkills);
  const application = applicationsByJob.get(job.jobId);
  return {
    ...job,
    _id: String(job._id),
    match,
    application: application
      ? { applicationId: application.applicationId, status: application.status }
      : null,
  };
};

const handleError = (res, error, message) => {
  if (error.status) return res.status(error.status).json({ success: false, message: error.message });
  console.error(`[Student Career Error] ${message}`, error);
  return res.status(500).json({ success: false, message });
};

export const getCareerDashboard = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const context = await getCareerContext(req.user.id);
    const [jobs, applications, interviews] = await Promise.all([
      Job.find({ status: 'ACTIVE', applicationDeadline: { $gte: new Date() } })
        .sort({ postedAt: -1 })
        .limit(50)
        .lean(),
      JobApplication.find({ candidateId: String(req.user.id) }).sort({ appliedDate: -1 }).lean(),
      Interview.find({ candidateId: String(req.user.id) }).sort({ date: 1 }).lean(),
    ]);
    const applicationsByJob = new Map(applications.map((application) => [application.jobId, application]));
    const recommendedJobs = jobs
      .map((job) => buildJobCard(job, context.actualSkills, applicationsByJob))
      .sort((left, right) => (right.match.matchPercentage ?? -1) - (left.match.matchPercentage ?? -1))
      .slice(0, 4);
    return res.json({
      success: true,
      data: {
        profile: serializeProfile(context),
        summary: {
          totalApplications: applications.length,
          underReview: applications.filter((application) => application.status === 'SCREENING').length,
          shortlisted: applications.filter((application) => ['SHORTLISTED', 'INTERVIEW'].includes(application.status)).length,
          selected: applications.filter((application) => application.status === 'SELECTED').length,
        },
        recommendedJobs,
        upcomingInterviews: interviews.filter(
          (interview) => interview.status === 'SCHEDULED' && new Date(interview.date) >= new Date()
        ),
        skillGaps: context.tracker.skills.filter((skill) => !skill.assessed || skill.score < 60),
      },
    });
  } catch (error) {
    return handleError(res, error, 'Unable to load your career dashboard.');
  }
};

export const getCareerProfile = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const context = await getCareerContext(req.user.id);
    return res.json({ success: true, data: serializeProfile(context) });
  } catch (error) {
    return handleError(res, error, 'Unable to load your career profile.');
  }
};

export const updateCareerProfile = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const allowedFields = [
      'education',
      'experience',
      'careerObjective',
      'location',
      'preferredRoles',
      'preferredLocations',
      'workModePreference',
      'skills',
      'resumeUrl',
    ];
    const fields = Object.keys(req.body || {});
    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({ success: false, message: 'Provide valid career profile fields.' });
    }

    const update = {};
    for (const field of fields) {
      const value = req.body[field];
      if (['preferredRoles', 'preferredLocations', 'skills'].includes(field)) {
        if (
          !Array.isArray(value) ||
          value.length > 30 ||
          value.some((entry) => typeof entry !== 'string' || entry.trim().length > 100)
        ) {
          return res.status(400).json({ success: false, message: `${field} must be a list of up to 30 short text values.` });
        }
        update[field] = [...new Set(value.map((entry) => entry.trim()).filter(Boolean))];
      } else {
        if (typeof value !== 'string' || value.trim().length > 1000) {
          return res.status(400).json({ success: false, message: `${field} must be text with at most 1000 characters.` });
        }
        if (field === 'resumeUrl' && value.trim() && !/^https?:\/\/\S+$/i.test(value.trim())) {
          return res.status(400).json({ success: false, message: 'Resume URL must be a valid HTTP or HTTPS URL.' });
        }
        update[field] = value.trim();
      }
    }

    await CandidateProfile.findOneAndUpdate(
      { studentId: String(req.user.id) },
      {
        $set: { ...update, name: req.user.name, email: req.user.email },
        $setOnInsert: { studentId: String(req.user.id) },
      },
      { upsert: true, new: true, runValidators: true }
    );
    const context = await getCareerContext(req.user.id);
    return res.json({ success: true, data: serializeProfile(context) });
  } catch (error) {
    return handleError(res, error, 'Unable to update your career profile.');
  }
};

export const getStudentJobs = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const context = await getCareerContext(req.user.id);
    const query = { status: 'ACTIVE', applicationDeadline: { $gte: new Date() } };
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const location = typeof req.query.location === 'string' ? req.query.location.trim().slice(0, 100) : '';
    const company = typeof req.query.company === 'string' ? req.query.company.trim().slice(0, 100) : '';
    if (search) query.$or = ['title', 'company', 'description'].map((field) => ({
      [field]: new RegExp(escapeRegex(search), 'i'),
    }));
    if (location) query.location = new RegExp(escapeRegex(location), 'i');
    if (company) query.company = new RegExp(escapeRegex(company), 'i');
    if (['Full-time', 'Part-time', 'Internship'].includes(req.query.jobType)) {
      query.employmentType = req.query.jobType;
    }
    const skill = typeof req.query.skill === 'string' ? req.query.skill.trim().slice(0, 100) : '';
    if (skill) query.requiredSkills = new RegExp(escapeRegex(skill), 'i');

    const [jobs, applications] = await Promise.all([
      Job.find(query).sort({ postedAt: -1 }).limit(100).lean(),
      JobApplication.find({ candidateId: String(req.user.id) })
        .select('jobId applicationId status')
        .lean(),
    ]);
    const applicationsByJob = new Map(applications.map((application) => [application.jobId, application]));
    let data = jobs.map((job) => buildJobCard(job, context.actualSkills, applicationsByJob));
    if (req.query.eligible === 'true') {
      data = data.filter((job) => job.match.missingSkills.length === 0);
    }
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Unable to load jobs.');
  }
};

export const getStudentJobDetails = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const context = await getCareerContext(req.user.id);
    const job = await Job.findOne({ jobId: req.params.jobId }).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    const [application, related] = await Promise.all([
      JobApplication.findOne({ jobId: job.jobId, candidateId: String(req.user.id) }).lean(),
      Job.find({
        status: 'ACTIVE',
        applicationDeadline: { $gte: new Date() },
        jobId: { $ne: job.jobId },
      }).select('jobId requiredSkills').lean(),
    ]);
    return res.json({
      success: true,
      data: {
        ...buildJobCard(job, context.actualSkills, new Map(application ? [[job.jobId, application]] : [])),
        isOpen: isOpenJob(job),
        expired: new Date(job.applicationDeadline) < new Date(),
        relatedJobs: related.slice(0, 5).map((item) => item.jobId),
      },
    });
  } catch (error) {
    return handleError(res, error, 'Unable to load job details.');
  }
};

export const applyToJob = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const { coverMessage = '' } = req.body || {};
    if (typeof coverMessage !== 'string' || coverMessage.length > 3000) {
      return res.status(400).json({ success: false, message: 'Cover message must be 3000 characters or fewer.' });
    }
    const [job, context] = await Promise.all([
      Job.findOne({ jobId: req.params.jobId }),
      getCareerContext(req.user.id),
    ]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (!isOpenJob(job)) return res.status(409).json({ success: false, message: 'This job is closed or past its application deadline.' });
    const existing = await JobApplication.findOne({
      jobId: job.jobId,
      candidateId: String(req.user.id),
    }).select('applicationId status').lean();
    if (existing) return res.status(409).json({ success: false, message: 'You have already applied for this job.', data: existing });
    if (!context.profile?.resumeUrl) {
      return res.status(400).json({ success: false, message: 'Add a resume URL to your career profile before applying.' });
    }

    const match = calculateJobMatch(job, context.actualSkills);
    const applicationId = `app_${randomUUID()}`;
    let application;
    try {
      application = await JobApplication.create({
        applicationId,
        jobId: job.jobId,
        jobTitle: job.title,
        company: job.company,
        candidateId: String(req.user.id),
        candidateName: context.user.name,
        candidateEmail: context.user.email,
        resumeUrl: context.profile.resumeUrl,
        coverMessage: coverMessage.trim(),
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        skillMatchPercentage: match.matchPercentage,
        status: 'APPLIED',
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
      }
      throw error;
    }

    await Job.updateOne({ _id: job._id }, { $inc: { applicantsCount: 1 } });
    if (job.recruiterId) {
      await createUserNotification({
        userId: job.recruiterId,
        eventKey: `application:${application.applicationId}:applied`,
        title: 'New job application',
        message: `${context.user.name} applied for ${job.title}.`,
        category: 'career',
        link: '/recruiter/applications',
      });
    }
    return res.status(201).json({
      success: true,
      data: {
        applicationId: application.applicationId,
        jobId: application.jobId,
        status: application.status,
        appliedDate: application.appliedDate,
        match,
      },
    });
  } catch (error) {
    return handleError(res, error, 'Unable to submit your application.');
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const applications = await JobApplication.find({ candidateId: String(req.user.id) })
      .sort({ appliedDate: -1 })
      .lean();
    return res.json({ success: true, data: applications });
  } catch (error) {
    return handleError(res, error, 'Unable to load your applications.');
  }
};

export const getStudentInterviews = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const interviews = await Interview.find({ candidateId: String(req.user.id) })
      .sort({ date: 1 })
      .lean();
    return res.json({ success: true, data: interviews });
  } catch (error) {
    return handleError(res, error, 'Unable to load your interviews.');
  }
};

export const getCareerProfileForRecruiter = async (studentId) => {
  if (!mongoose.isValidObjectId(studentId)) return null;
  const context = await getCareerContext(studentId);
  const practiceScores = context.tracker.skills.flatMap((skill) =>
    skill.evidence.filter((evidence) => evidence.type === 'practice').map((evidence) => evidence.score)
  );
  const assessmentScores = context.tracker.skills.flatMap((skill) =>
    skill.evidence.filter((evidence) => evidence.type === 'assessment').map((evidence) => evidence.score)
  );
  const average = (scores) => scores.length
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : null;
  return {
    ...serializeProfile(context),
    overallSkillScore: context.tracker.summary.overallScore,
    practiceAccuracy: average(practiceScores),
    assessmentScore: average(assessmentScores),
    careerReadinessScore: null,
    strengths: context.tracker.summary.strengths.map((skill) => skill.name),
    weakAreas: context.tracker.skills
      .filter((skill) => skill.score === null || skill.score < 60)
      .map((skill) => skill.name),
  };
};
