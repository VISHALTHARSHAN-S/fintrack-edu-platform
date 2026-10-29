import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { User } from '../models/User.js';
import { createUserNotification } from '../services/notificationService.js';

const jobFields = [
  'title',
  'company',
  'location',
  'workMode',
  'employmentType',
  'experienceLevel',
  'salaryRange',
  'requiredSkills',
  'preferredSkills',
  'description',
  'responsibilities',
  'requirements',
  'applicationDeadline',
  'status',
];

const validateJobPayload = (payload, partial = false) => {
  const keys = Object.keys(payload || {});
  if (keys.some((key) => !jobFields.includes(key))) return 'Unsupported job field.';
  if (!partial && ['title', 'company', 'location', 'experienceLevel', 'description', 'applicationDeadline'].some((key) => !payload[key])) {
    return 'Title, company, location, experience level, description, and application deadline are required.';
  }
  for (const field of ['title', 'company', 'location', 'experienceLevel', 'salaryRange', 'description']) {
    if (payload[field] !== undefined && (typeof payload[field] !== 'string' || payload[field].length > 5000)) {
      return `${field} must be a string with at most 5000 characters.`;
    }
  }
  for (const field of ['requiredSkills', 'preferredSkills', 'responsibilities', 'requirements']) {
    if (
      payload[field] !== undefined &&
      (!Array.isArray(payload[field]) ||
        payload[field].length > 50 ||
        payload[field].some((item) => typeof item !== 'string' || item.trim().length > 200))
    ) {
      return `${field} must be a list of strings.`;
    }
  }
  if (!partial && (!Array.isArray(payload.requiredSkills) || payload.requiredSkills.length === 0)) {
    return 'At least one required skill is required.';
  }
  if (payload.status !== undefined && !['DRAFT', 'ACTIVE', 'CLOSED'].includes(payload.status)) {
    return 'Invalid job status.';
  }
  if (payload.applicationDeadline !== undefined && Number.isNaN(new Date(payload.applicationDeadline).getTime())) {
    return 'A valid application deadline is required.';
  }
  return '';
};

const notifyMatchingStudents = async (job) => {
  if (job.status !== 'ACTIVE' || new Date(job.applicationDeadline) < new Date()) return;
  const requiredSkills = (job.requiredSkills || []).filter(Boolean);
  if (!requiredSkills.length) return;
  const rolePattern = new RegExp(job.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const matchingProfiles = await CandidateProfile.find({
    $or: [{ skills: { $in: requiredSkills } }, { preferredRoles: rolePattern }],
  }).select('studentId').limit(1000).lean();
  const studentIds = [...new Set(matchingProfiles.map((profile) => profile.studentId))]
    .filter((studentId) => mongoose.isValidObjectId(studentId));
  const eligibleUsers = await User.find({
    _id: { $in: studentIds },
    role: 'student',
    status: 'active',
  }).select('_id').lean();
  await Promise.all(eligibleUsers.map((student) => createUserNotification({
    userId: student._id,
    eventKey: `job:${job.jobId}:recommendation:${student._id}`,
    title: 'A new job may match your profile',
    message: `${job.title} at ${job.company} is now open.`,
    category: 'career',
    link: `/student/career/jobs/${encodeURIComponent(job.jobId)}`,
  })));
};

// Get Jobs List
export const getJobs = async (req, res) => {
  try {
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Job management requires a connected database.' });
    const jobs = await Job.find({ recruiterId: req.user.id }).sort({ postedAt: -1 }).lean();
    return res.json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Job Details
export const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Job management requires a connected database.' });
    const job = await Job.findOne({ jobId, recruiterId: req.user.id }).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    const applicants = await JobApplication.find({ jobId: job.jobId }).sort({ appliedDate: -1 }).lean();
    return res.json({ success: true, data: { ...job, applicants } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create New Job
export const createJob = async (req, res) => {
  try {
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Job management requires a connected database.' });
    const validationError = validateJobPayload(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (req.body.status === 'ACTIVE' && new Date(req.body.applicationDeadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'An active job must have a future deadline.' });
    }
    const job = await Job.create({
      ...req.body,
      jobId: `job_${randomUUID()}`,
      recruiterId: req.user.id,
    });
    await notifyMatchingStudents(job);
    return res.status(201).json({ success: true, message: 'Job posting created successfully.', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Job Status / Details
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Job management requires a connected database.' });
    const validationError = validateJobPayload(updates, true);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (updates.status === 'ACTIVE' && updates.applicationDeadline && new Date(updates.applicationDeadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'An active job must have a future deadline.' });
    }
    const job = await Job.findOneAndUpdate(
      { jobId, recruiterId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (updates.status === 'ACTIVE') await notifyMatchingStudents(job);
    return res.json({ success: true, message: 'Job updated successfully.', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
