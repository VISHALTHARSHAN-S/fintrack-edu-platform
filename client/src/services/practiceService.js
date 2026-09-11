import API from './api';
import { MOCK_PRACTICE_OVERVIEW, MOCK_PRACTICE_QUESTIONS } from '../data/mockPracticeData';

export const fetchPracticeOverview = async () => {
  try {
    const res = await API.get('/practice/overview');
    return res.data.data;
  } catch (error) {
    console.warn('[Practice API] Using fallback mock data:', error.message);
    return MOCK_PRACTICE_OVERVIEW;
  }
};

export const startPracticeSessionApi = async (params) => {
  try {
    const res = await API.post('/practice/start', params);
    return res.data.data;
  } catch (error) {
    console.warn('[Practice API] Using fallback practice session questions');
    return {
      sessionId: `practice_${Date.now()}`,
      topic: params.topic || 'Digital Payments',
      difficulty: params.difficulty || 'Intermediate',
      totalQuestions: Math.min(params.questionCount || 5, MOCK_PRACTICE_QUESTIONS.length),
      questions: MOCK_PRACTICE_QUESTIONS.slice(0, params.questionCount || 5),
    };
  }
};

export const submitPracticeSessionApi = async (practiceId, payload) => {
  try {
    const res = await API.post(`/practice/${practiceId}/submit`, payload);
    return res.data.data;
  } catch (error) {
    console.warn('[Practice API] Using fallback practice result evaluation');
    const answers = payload.answers || [];
    let correctCount = 0;
    const detailedResponses = answers.map((ans, idx) => {
      const q = MOCK_PRACTICE_QUESTIONS.find((item) => item.questionId === ans.questionId) || MOCK_PRACTICE_QUESTIONS[idx % MOCK_PRACTICE_QUESTIONS.length];
      const isCorrect = ans.selectedOptionId === 'opt1' || ans.selectedOptionId === 'opt2';
      if (isCorrect) correctCount++;
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        selectedOptionId: ans.selectedOptionId,
        correctOptionId: 'opt2',
        isCorrect,
        explanation: q.explanation,
      };
    });

    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 80;

    return {
      sessionId: practiceId,
      topic: payload.topic || 'Digital Payments',
      difficulty: payload.difficulty || 'Intermediate',
      totalQuestions: answers.length || 5,
      score: correctCount,
      accuracyPercentage: accuracy,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: answers.length - correctCount,
      skippedCount: 0,
      timeTakenSeconds: payload.timeTakenSeconds || 140,
      performanceLevel: accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Improvement',
      responses: detailedResponses,
      suggestions:
        accuracy >= 80
          ? 'Exceptional mastery of core concepts! Keep building your skill score.'
          : 'Re-read the underlying theory and attempt a 5-question review session.',
    };
  }
};
