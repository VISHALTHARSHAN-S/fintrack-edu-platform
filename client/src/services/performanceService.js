import API from './api';
import { MOCK_PERFORMANCE_DATA } from '../data/mockPracticeData';

export const fetchStudentPerformance = async () => {
  try {
    const res = await API.get('/student/performance');
    return res.data.data;
  } catch (error) {
    console.warn('[Performance API] Using fallback performance stats');
    return MOCK_PERFORMANCE_DATA;
  }
};
