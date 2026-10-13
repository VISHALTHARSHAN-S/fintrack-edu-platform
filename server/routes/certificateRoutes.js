import express from 'express';
import {
  downloadCertificate,
  getCertificate,
  getEligibleCourses,
  issueCertificate,
  listCertificates,
  verifyCertificate,
} from '../controllers/certificateController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/verify/:verificationId', verifyCertificate);

router.use(protect, authorizeRoles('student'));
router.get('/', listCertificates);
router.get('/eligible', getEligibleCourses);
router.post('/courses/:courseId/issue', issueCertificate);
router.get('/:certificateId/pdf', downloadCertificate);
router.get('/:certificateId', getCertificate);

export default router;
