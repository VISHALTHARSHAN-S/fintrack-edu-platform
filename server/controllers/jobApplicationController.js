import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { createUserNotification } from '../services/notificationService.js';

const validStatuses = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];
const allowedTransitions = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'SELECTED', 'REJECTED'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: [],
};

// Get Applications List
export const getApplications = async (req, res) => {
  try {
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Applications require a connected database.' });
      const jobs = await Job.find({ recruiterId: req.user.id }).select('jobId').lean();
      const applications = await JobApplication.find({ jobId: { $in: jobs.map((job) => job.jobId) } })
        .sort({ appliedDate: -1 })
        .lean();
      return res.json({ success: true, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Application Pipeline Status (APPLIED -> SCREENING -> SHORTLISTED -> INTERVIEW -> SELECTED / REJECTED)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status.' });
    }
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Applications require a connected database.' });
      const application = await JobApplication.findOne({ applicationId });
      if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
      const ownedJob = await Job.findOne({ jobId: application.jobId, recruiterId: req.user.id }).select('_id').lean();
      if (!ownedJob) return res.status(404).json({ success: false, message: 'Application not found.' });
      const previousStatus = application.status;
      if (previousStatus !== status && !allowedTransitions[previousStatus]?.includes(status)) {
        return res.status(409).json({
          success: false,
          message: `Application status cannot move from ${previousStatus} to ${status}.`,
        });
      }
      if (previousStatus !== status) {
        application.status = status;
        await application.save();
      }
      if (status !== 'APPLIED') {
        await createUserNotification({
          userId: application.candidateId,
          eventKey: `application:${application.applicationId}:status:${status}`,
          title: 'Application status updated',
          message: `Your application for ${application.jobTitle} is now ${status === 'SCREENING' ? 'under review' : status.toLowerCase()}.`,
          category: 'career',
          type: status === 'REJECTED' ? 'warning' : 'info',
          link: '/student/career/applications',
        });
      }
      return res.json({ success: true, message: `Application status: ${status}`, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
