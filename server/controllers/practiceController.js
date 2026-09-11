import { Question } from '../models/Question.js';
import { PracticeSession } from '../models/PracticeSession.js';
import { SEEDED_QUESTIONS } from '../seed/practiceSeedData.js';

// Get Practice Overview / Categories
export const getPracticeOverview = async (req, res) => {
  try {
    const studentId = req.user.id;

    let totalAttempted = 145;
    let overallAccuracy = 82;
    let streakDays = 15;
    let questionsSolved = 145;
    let recentSessions = [];

    if (req.isDbConnected) {
      const sessions = await PracticeSession.find({ studentId }).sort({ createdAt: -1 }).limit(5);
      if (sessions.length > 0) {
        recentSessions = sessions;
        totalAttempted = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);
        const totalCorrect = sessions.reduce((acc, s) => acc + s.correctAnswersCount, 0);
        overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      }
    }

    const categories = [
      { id: 'dp', name: 'Digital Payments', count: 45, icon: 'CreditCard', recommended: true },
      { id: 'upi', name: 'UPI', count: 38, icon: 'QrCode', recommended: true },
      { id: 'bnb', name: 'Banking & Neo Banking', count: 40, icon: 'Building', recommended: false },
      { id: 'bc', name: 'Blockchain & Crypto', count: 32, icon: 'Shield', recommended: false },
      { id: 'sec', name: 'Cybersecurity', count: 28, icon: 'Lock', recommended: true },
      { id: 'fm', name: 'Financial Markets', count: 35, icon: 'TrendingUp', recommended: false },
      { id: 'fa', name: 'FinTech Analytics', count: 30, icon: 'BarChart', recommended: false },
      { id: 'it', name: 'InsurTech', count: 25, icon: 'FileText', recommended: false },
    ];

    return res.json({
      success: true,
      data: {
        stats: {
          totalAttempted,
          overallAccuracy,
          practiceStreak: `${streakDays} Days`,
          questionsSolved,
        },
        categories,
        recommendedPractice: {
          topic: 'Cybersecurity',
          reason: 'Your accuracy in Cybersecurity is lower than average. Strengthen this area today.',
          questionsCount: 5,
        },
        recentActivity: recentSessions.length > 0 ? recentSessions : [
          { sessionId: 'sess_demo_1', topic: 'UPI', accuracyPercentage: 90, score: 9, totalQuestions: 10, createdAt: new Date() },
          { sessionId: 'sess_demo_2', topic: 'Digital Payments', accuracyPercentage: 85, score: 8, totalQuestions: 10, createdAt: new Date(Date.now() - 86400000) },
        ],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Start a Practice Session (creates or retrieves questions for selected topic & difficulty)
export const startPracticeSession = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { topic = 'Digital Payments', difficulty = 'Intermediate', questionCount = 5 } = req.body;

    let selectedQuestions = [];

    if (req.isDbConnected) {
      let dbQuestions = await Question.find({ topic, difficulty }).limit(Number(questionCount));
      if (!dbQuestions || dbQuestions.length === 0) {
        dbQuestions = await Question.find({ topic }).limit(Number(questionCount));
      }
      selectedQuestions = dbQuestions;
    }

    if (selectedQuestions.length === 0) {
      selectedQuestions = SEEDED_QUESTIONS.filter(
        (q) => q.topic.toLowerCase() === topic.toLowerCase()
      );
      if (selectedQuestions.length === 0) {
        selectedQuestions = SEEDED_QUESTIONS;
      }
      selectedQuestions = selectedQuestions.slice(0, Number(questionCount));
    }

    const sessionId = `practice_${Date.now()}`;

    if (req.isDbConnected) {
      await PracticeSession.create({
        sessionId,
        studentId,
        topic,
        difficulty,
        totalQuestions: selectedQuestions.length,
        status: 'in-progress',
      });
    }

    return res.json({
      success: true,
      data: {
        sessionId,
        topic,
        difficulty,
        totalQuestions: selectedQuestions.length,
        questions: selectedQuestions.map((q) => ({
          questionId: q.questionId,
          topic: q.topic,
          difficulty: q.difficulty,
          questionText: q.questionText,
          options: q.options.map((opt) => ({ id: opt.id, text: opt.text })), // Hide correct answer initially
          explanation: q.explanation,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Practice Session
export const submitPracticeSession = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { practiceId } = req.params;
    const { topic, difficulty, answers, timeTakenSeconds } = req.body;

    let totalQuestions = answers ? answers.length : 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const detailedResponses = answers.map((ans) => {
      const originalQ = SEEDED_QUESTIONS.find((q) => q.questionId === ans.questionId);
      const correctOpt = originalQ?.options.find((o) => o.isCorrect);

      const isCorrect = correctOpt && correctOpt.id === ans.selectedOptionId;
      if (!ans.selectedOptionId) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        questionId: ans.questionId,
        questionText: originalQ?.questionText || 'FinTech Practice Question',
        options: originalQ?.options || [],
        selectedOptionId: ans.selectedOptionId,
        correctOptionId: correctOpt?.id || null,
        isCorrect: Boolean(isCorrect),
        explanation: originalQ?.explanation || 'Explanation provided.',
      };
    });

    const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    let performanceLevel = 'Needs Improvement';
    if (accuracyPercentage >= 80) performanceLevel = 'Excellent';
    else if (accuracyPercentage >= 60) performanceLevel = 'Good';

    if (req.isDbConnected) {
      await PracticeSession.findOneAndUpdate(
        { sessionId: practiceId },
        {
          studentId,
          topic,
          difficulty,
          totalQuestions,
          correctAnswersCount: correctCount,
          incorrectAnswersCount: incorrectCount,
          skippedCount,
          accuracyPercentage,
          score: correctCount,
          timeTakenSeconds: timeTakenSeconds || 120,
          performanceLevel,
          status: 'completed',
        },
        { upsert: true }
      );
    }

    return res.json({
      success: true,
      data: {
        sessionId: practiceId,
        topic: topic || 'FinTech Practice',
        difficulty: difficulty || 'Intermediate',
        totalQuestions,
        score: correctCount,
        accuracyPercentage,
        correctAnswersCount: correctCount,
        incorrectAnswersCount: incorrectCount,
        skippedCount,
        timeTakenSeconds: timeTakenSeconds || 120,
        performanceLevel,
        responses: detailedResponses,
        suggestions:
          accuracyPercentage < 70
            ? 'We recommend revising the core theory module for this topic and attempting another 5-question practice set.'
            : 'Great job! You have demonstrated solid command of this topic. Try an Advanced difficulty set next.',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
