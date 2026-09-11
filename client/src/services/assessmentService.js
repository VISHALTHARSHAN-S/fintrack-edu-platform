import API from './api';
import { MOCK_ASSESSMENTS_DATA, MOCK_PRACTICE_QUESTIONS } from '../data/mockPracticeData';

export const fetchAssessmentCenter = async () => {
  try {
    const res = await API.get('/assessments');
    return res.data.data;
  } catch (error) {
    console.warn('[Assessment API] Using fallback mock data:', error.message);
    return MOCK_ASSESSMENTS_DATA;
  }
};

export const fetchAssessmentDetails = async (assessmentId) => {
  try {
    const res = await API.get(`/assessments/${assessmentId}`);
    return res.data.data;
  } catch (error) {
    const found = MOCK_ASSESSMENTS_DATA.available.find((a) => a.assessmentId === assessmentId);
    return found || MOCK_ASSESSMENTS_DATA.available[0];
  }
};

export const startAssessmentAttemptApi = async (assessmentId) => {
  try {
    const res = await API.post(`/assessments/${assessmentId}/start`);
    return res.data.data;
  } catch (error) {
    const asm = MOCK_ASSESSMENTS_DATA.available.find((a) => a.assessmentId === assessmentId) || MOCK_ASSESSMENTS_DATA.available[0];
    return {
      attemptId: `attempt_${Date.now()}`,
      assessment: {
        assessmentId: asm.assessmentId,
        title: asm.title,
        durationMinutes: asm.durationMinutes,
        totalQuestions: 5,
        totalMarks: asm.totalMarks,
        passingPercentage: asm.passingPercentage,
      },
      questions: MOCK_PRACTICE_QUESTIONS.map((q, idx) => ({
        questionId: q.questionId,
        questionNumber: idx + 1,
        questionText: q.questionText,
        options: q.options,
        marks: 20,
      })),
    };
  }
};

export const submitAssessmentAttemptApi = async (assessmentId, payload) => {
  try {
    const res = await API.post(`/assessments/${assessmentId}/submit`, payload);
    return res.data.data;
  } catch (error) {
    const asm = MOCK_ASSESSMENTS_DATA.available.find((a) => a.assessmentId === assessmentId) || MOCK_ASSESSMENTS_DATA.available[0];
    const answers = payload.answers || [];
    let correctCount = 0;
    let skippedCount = 0;

    const detailedResponses = answers.map((ans, idx) => {
      const q = MOCK_PRACTICE_QUESTIONS[idx % MOCK_PRACTICE_QUESTIONS.length];
      if (!ans.selectedOptionId) skippedCount++;
      const isCorrect = ans.selectedOptionId === 'opt2' || ans.selectedOptionId === 'opt1';
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId,
        questionText: q.questionText,
        options: q.options,
        selectedOptionId: ans.selectedOptionId,
        correctOptionId: 'opt2',
        isCorrect,
        isMarkedForReview: ans.isMarkedForReview || false,
        explanation: q.explanation,
      };
    });

    const percentage = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 80;
    const score = Math.round((percentage / 100) * asm.totalMarks);
    const passStatus = percentage >= asm.passingPercentage ? 'PASSED' : 'FAILED';

    return {
      attemptId: payload.attemptId,
      assessmentId,
      title: asm.title,
      score,
      maxMarks: asm.totalMarks,
      percentage,
      passingPercentage: asm.passingPercentage,
      passStatus,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: answers.length - correctCount - skippedCount,
      skippedCount,
      timeTakenSeconds: payload.timeTakenSeconds || 420,
      responses: detailedResponses,
      strengths: ['Digital Payments Core Architecture', 'UPI Mandate Mechanisms'],
      weaknesses: percentage < 75 ? ['Cybersecurity & Network Encryption'] : [],
      recommendedTopics: percentage < 75 ? ['Cybersecurity', 'Financial Markets'] : ['Advanced FinTech Analytics'],
    };
  }
};
