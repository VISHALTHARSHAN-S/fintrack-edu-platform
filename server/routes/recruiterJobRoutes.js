import express from 'express';
import { getJobs, getJobDetails, createJob, updateJob } from '../controllers/jobController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/', getJobs);
router.post('/', createJob);
router.get('/:jobId', getJobDetails);
router.put('/:jobId', updateJob);

export default router;