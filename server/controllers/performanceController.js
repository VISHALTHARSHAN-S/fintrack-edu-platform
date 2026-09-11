import { SEEDED_PERFORMANCE_STATS } from '../seed/practiceSeedData.js';

// Get Student Performance Dashboard Data
export const getStudentPerformance = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_PERFORMANCE_STATS,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
