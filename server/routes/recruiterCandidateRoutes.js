import express from 'express';
import { getCandidates, getCandidateDetails } from '../controllers/recruiterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/', getCandidates);
router.get('/:candidateId', getCandidateDetails);

export default router;