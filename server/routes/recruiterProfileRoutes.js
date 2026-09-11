import express from 'express';
import { getRecruiterProfile, updateRecruiterProfile } from '../controllers/recruiterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/', getRecruiterProfile);
router.put('/', updateRecruiterProfile);

export default router;