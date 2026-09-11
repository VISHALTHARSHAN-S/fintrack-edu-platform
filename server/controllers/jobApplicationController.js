import { SEEDED_APPLICATIONS } from '../seed/recruiterSeedData.js';

// Get Applications List
export const getApplications = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_APPLICATIONS,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Application Pipeline Status (APPLIED -> SCREENING -> SHORTLISTED -> INTERVIEW -> SELECTED / REJECTED)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const app = SEEDED_APPLICATIONS.find((a) => a.applicationId === applicationId);
    if (app) {
      app.status = status;
    }

    return res.json({
      success: true,
      message: `Candidate application moved to status: ${status}`,
      data: app || { applicationId, status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
