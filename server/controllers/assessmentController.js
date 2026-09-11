import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { SEEDED_ASSESSMENTS, SEEDED_QUESTIONS } from '../seed/practiceSeedData.js';

// Get Assessment Center overview & list
export const getAssessmentCenter = async (req, res) => {
  try {
    const studentId = req.user.id;

    let available = [...SEEDED_ASSESSMENTS];
    let upcoming = [
      {
        assessmentId: 'asm_upcoming_1',
        title: 'Advanced InsurTech & Telematics Evaluation',
        topic: 'InsurTech',
        difficulty: 'Advanced',
        durationMinutes: 40,
        totalQuestions: 15,
        totalMarks: 100,
        passingPercentage: 75,
        startDate: 'Tomorrow at 10:00 AM',
        status: 'UPCOMING',
      },
    ];
    let completed = [];

    if (req.isDbConnected) {
      const attempts = await AssessmentAttempt.find({ studentId, status: 'completed' });
      if (attempts.length > 0) {
        completed = attempts.map((att) => ({
          attemptId: att.attemptId,
          assessmentId: att.assessmentId,
          score: att.score,
          maxMarks: att.maxMarks,
          percentage: att.percentage,
          passStatus: att.passStatus,
          completedAt: att.completedAt,
        }));
      }
    }

    return res.json({
      success: true,
      data: {
        available: available.map((a) => ({ ...a, status: 'AVAILABLE' })),
        upcoming,
        completed: completed.length > 0 ? completed : [
          {
            assessmentId: 'asm_101',
            title: 'FinTech Core Certification Exam 2026',
            score: 80,
            maxMarks: 100,
            percentage: 80,
            passStatus: 'PASSED',
            completedAt: new Date(Date.now() - 86400000 * 5),
            status: 'COMPLETED',
          },
        ],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single Assessment details
export const getAssessmentDetails = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    let assessment = SEEDED_ASSESSMENTS.find((a) => a.assessmentId === assessmentId) || SEEDED_ASSESSMENTS[0];

    return res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Start Assessment Attempt
export const startAssessmentAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assessmentId } = req.params;

    let assessment = SEEDED_ASSESSMENTS.find((a) => a.assessmentId === assessmentId) || SEEDED_ASSESSMENTS[0];
    const attemptId = `attempt_${Date.now()}`;

    // Questions pool for exam
    const questions = SEEDED_QUESTIONS.map((q, idx) => ({
      questionId: q.questionId,
      questionNumber: idx + 1,
      questionText: q.questionText,
      options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
      marks: q.marks,
    }));

    if (req.isDbConnected) {
      await AssessmentAttempt.create({
        attemptId,
        studentId,
        assessmentId,
        maxMarks: assessment.totalMarks,
        startedAt: new Date(),
        status: 'in-progress',
      });
    }

    return res.json({
      success: true,
      data: {
        attemptId,
        assessment: {
          assessmentId: assessment.assessmentId,
          title: assessment.title,
          durationMinutes: assessment.durationMinutes,
          totalQuestions: questions.length,
          totalMarks: assessment.totalMarks,
          passingPercentage: assessment.passingPercentage,
        },
        questions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Assessment Attempt
export const submitAssessmentAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assessmentId } = req.params;
    const { attemptId, answers, timeTakenSeconds } = req.body;

    let assessment = SEEDED_ASSESSMENTS.find((a) => a.assessmentId === assessmentId) || SEEDED_ASSESSMENTS[0];

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let scoreObtained = 0;

    const detailedResponses = answers.map((ans) => {
      const originalQ = SEEDED_QUESTIONS.find((q) => q.questionId === ans.questionId);
      const correctOpt = originalQ?.options.find((o) => o.isCorrect);

      const isCorrect = correctOpt && correctOpt.id === ans.selectedOptionId;
      if (!ans.selectedOptionId) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
        scoreObtained += (originalQ?.marks || 10);
      } else {
        incorrectCount++;
      }

      return {
        questionId: ans.questionId,
        questionText: originalQ?.questionText || 'Assessment Question',
        options: originalQ?.options || [],
        selectedOptionId: ans.selectedOptionId,
        correctOptionId: correctOpt?.id || null,
        isCorrect: Boolean(isCorrect),
        isMarkedForReview: ans.isMarkedForReview || false,
        explanation: originalQ?.explanation || '',
      };
    });

    const percentage = Math.round((correctCount / answers.length) * 100);
    const passStatus = percentage >= assessment.passingPercentage ? 'PASSED' : 'FAILED';

    if (req.isDbConnected) {
      await AssessmentAttempt.findOneAndUpdate(
        { attemptId },
        {
          studentId,
          assessmentId,
          score: scoreObtained,
          maxMarks: assessment.totalMarks,
          percentage,
          passStatus,
          correctAnswersCount: correctCount,
          incorrectAnswersCount: incorrectCount,
          skippedCount,
          timeTakenSeconds: timeTakenSeconds || 300,
          status: 'completed',
          completedAt: new Date(),
        },
        { upsert: true }
      );
    }

    return res.json({
      success: true,
      data: {
        attemptId,
        assessmentId,
        title: assessment.title,
        score: scoreObtained,
        maxMarks: assessment.totalMarks,
        percentage,
        passingPercentage: assessment.passingPercentage,
        passStatus,
        correctAnswersCount: correctCount,
        incorrectAnswersCount: incorrectCount,
        skippedCount,
        timeTakenSeconds: timeTakenSeconds || 300,
        responses: detailedResponses,
        strengths: ['Digital Payments Core Architecture', 'UPI Mandate Mechanisms'],
        weaknesses: percentage < 75 ? ['Cybersecurity & Network Encryption'] : [],
        recommendedTopics: percentage < 75 ? ['Cybersecurity', 'Financial Markets'] : ['Advanced FinTech Analytics'],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
