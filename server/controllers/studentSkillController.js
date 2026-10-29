import { buildStudentSkillTracker } from '../services/studentSkillService.js';

const requireDatabase = (req, res) => {
  if (!req.isDbConnected) {
    res.status(503).json({
      success: false,
      message: 'Skill tracking requires a connected database.',
    });
    return false;
  }
  return true;
};

export const getStudentSkillSummary = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;

    const tracker = await buildStudentSkillTracker(req.user.id);
    const skills = tracker.skills.map(({ evidence, ...skill }) => skill);

    return res.json({
      success: true,
      data: {
        summary: tracker.summary,
        skills,
        recommendations: tracker.recommendations,
        passport: tracker.passport,
      },
    });
  } catch (error) {
    console.error('[Student Skill Summary Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your skill summary.',
    });
  }
};

export const getStudentSkillDetails = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;

    const tracker = await buildStudentSkillTracker(req.user.id);
    const skill = tracker.skills.find((item) => item.id === req.params.skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    return res.json({
      success: true,
      data: {
        skill: {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          score: skill.score,
          level: skill.level,
          assessed: skill.assessed,
        },
        evidence: skill.evidence,
      },
    });
  } catch (error) {
    console.error('[Student Skill Details Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load evidence for this skill.',
    });
  }
};
