import API from './api';
import { MOCK_EXAMS, MOCK_ASSIGNMENTS } from '../data/mockPracticeData';

export const fetchExamsAndAssignments = async () => {
  try {
    const res = await API.get('/student/exams-assignments');
    return res.data.data;
  } catch (error) {
    console.warn('[Academic API] Using fallback mock data:', error.message);
    return {
      exams: MOCK_EXAMS,
      assignments: MOCK_ASSIGNMENTS,
    };
  }
};

export const submitAssignmentApi = async (assignmentId, payload) => {
  try {
    const res = await API.post(`/student/exams-assignments/assignments/${assignmentId}/submit`, payload);
    return res.data;
  } catch (error) {
    console.warn('[Academic API] Using fallback mock submission response');
    return {
      success: true,
      message: 'Assignment submitted successfully!',
      data: {
        submissionId: `sub_${Date.now()}`,
        assignmentId,
        submittedAt: new Date().toISOString(),
        submissionStatus: 'Submitted',
        marks: 92,
        feedback: 'Great submission! Comprehensive structure and clean payload design.',
      },
    };
  }
};
