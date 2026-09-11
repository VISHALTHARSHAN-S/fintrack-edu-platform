import { SEEDED_EXAMS, SEEDED_ASSIGNMENTS } from '../seed/practiceSeedData.js';

// Get Exams & Assignments Academic Dashboard
export const getExamsAndAssignments = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        exams: SEEDED_EXAMS,
        assignments: SEEDED_ASSIGNMENTS,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Mock Assignment
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content, attachmentName } = req.body;

    const assignment = SEEDED_ASSIGNMENTS.find((a) => a.assignmentId === assignmentId) || SEEDED_ASSIGNMENTS[0];

    return res.json({
      success: true,
      message: 'Assignment submitted successfully!',
      data: {
        submissionId: `sub_${Date.now()}`,
        assignmentId,
        title: assignment.title,
        content,
        attachmentName: attachmentName || 'solution_file.pdf',
        submittedAt: new Date().toISOString(),
        submissionStatus: 'Submitted',
        marks: null,
        feedback: 'Submission received. Automated demo evaluation: 92/100.',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
