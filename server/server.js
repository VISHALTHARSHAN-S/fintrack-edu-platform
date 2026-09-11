import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentLearningRoutes from './routes/studentLearningRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import examAssignmentRoutes from './routes/examAssignmentRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import recruiterDashboardRoutes from './routes/recruiterDashboardRoutes.js';
import recruiterJobRoutes from './routes/recruiterJobRoutes.js';
import recruiterCandidateRoutes from './routes/recruiterCandidateRoutes.js';
import recruiterApplicationRoutes from './routes/recruiterApplicationRoutes.js';
import recruiterInterviewRoutes from './routes/recruiterInterviewRoutes.js';
import recruiterProfileRoutes from './routes/recruiterProfileRoutes.js';
import recruiterMessageRoutes from './routes/recruiterMessageRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
let isDbConnected = false;
connectDB().then((status) => {
  isDbConnected = status;
});

// Middleware to attach DB connectivity status to request
app.use((req, res, next) => {
  req.isDbConnected = isDbConnected;
  next();
});

// Express Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root Route & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'FinTrack Edu Backend API',
    stage: 'Breakpoint 4 — Mentor Ecosystem',
    database: isDbConnected ? 'connected' : 'development-mock-fallback',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student/learning', studentLearningRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/student/exams-assignments', examAssignmentRoutes);
app.use('/api/student/performance', performanceRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/recruiter', recruiterDashboardRoutes);
app.use('/api/recruiter/jobs', recruiterJobRoutes);
app.use('/api/recruiter/candidates', recruiterCandidateRoutes);
app.use('/api/recruiter/applications', recruiterApplicationRoutes);
app.use('/api/recruiter/interviews', recruiterInterviewRoutes);
app.use('/api/recruiter/profile', recruiterProfileRoutes);
app.use('/api/recruiter/messages', recruiterMessageRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`[FinTrack Edu Server] Running on http://localhost:${PORT}`);
  console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================\n`);
});
