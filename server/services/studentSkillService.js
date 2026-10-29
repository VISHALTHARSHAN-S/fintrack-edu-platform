import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { Certificate } from '../models/Certificate.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { PracticeSession } from '../models/PracticeSession.js';
import { SkillPassport } from '../models/SkillPassport.js';
import { SEEDED_ASSESSMENTS } from '../seed/practiceSeedData.js';

const SKILLS = [
  {
    id: 'java',
    name: 'Java',
    category: 'Programming',
    terms: ['java'],
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Problem Solving',
    terms: ['dsa', 'data structure', 'algorithm'],
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Data',
    terms: ['sql', 'database'],
  },
  {
    id: 'react',
    name: 'React',
    category: 'Programming',
    terms: ['react', 'frontend', 'front-end'],
  },
  {
    id: 'fintech-fundamentals',
    name: 'FinTech Fundamentals',
    category: 'FinTech',
    terms: [
      'fintech',
      'digital payment',
      'payment',
      'upi',
      'banking',
      'neo bank',
      'blockchain',
      'crypto',
      'financial market',
      'cybersecurity',
      'insurtech',
      'regtech',
      'financial ai',
      'risk model',
      'quantitative finance',
    ],
  },
];

const normalizeText = (values) =>
  values
    .flat(Infinity)
    .filter((value) => typeof value === 'string' && value.trim())
    .join(' ')
    .toLowerCase();

const matchesSkill = (skill, text) =>
  skill.terms.some((term) => text.includes(term));

const getLevel = (score) => {
  if (score < 60) return 'Beginner';
  if (score < 85) return 'Intermediate';
  return 'Advanced';
};

const average = (values) =>
  values.length
    ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
    : null;

const formatAssessmentDefinitions = (databaseAssessments) => {
  const assessmentsById = new Map(
    SEEDED_ASSESSMENTS.map((assessment) => [assessment.assessmentId, assessment])
  );

  databaseAssessments.forEach((assessment) => {
    assessmentsById.set(assessment.assessmentId, assessment);
  });

  return [...assessmentsById.values()];
};

const getCourseSearchText = (course) =>
  normalizeText([
    course.title,
    course.category,
    course.stage,
    course.description,
    course.tags,
    course.outcomes,
    (course.modules || []).map((module) => [
      module.title,
      (module.lessons || []).map((lesson) => [lesson.title, lesson.content]),
    ]),
  ]);

const toEvidence = ({ id, type, title, description, date, score, href }) => ({
  id: String(id),
  type,
  title,
  description,
  date: date || null,
  score: Number.isFinite(score) ? score : null,
  href: href || null,
});

export const buildStudentSkillTracker = async (studentId) => {
  const [
    practiceSessions,
    assessmentAttempts,
    enrollments,
    certificates,
    courses,
    storedAssessments,
    skillPassport,
  ] = await Promise.all([
    PracticeSession.find({ studentId, status: 'completed' })
      .select('sessionId topic accuracyPercentage completedAt updatedAt createdAt')
      .lean(),
    AssessmentAttempt.find({ studentId, status: 'completed' })
      .select('attemptId assessmentId percentage completedAt updatedAt createdAt')
      .lean(),
    Enrollment.find({ studentId })
      .populate('courseId', 'title category difficulty stage description tags outcomes modules')
      .lean(),
    Certificate.find({ studentId, status: 'valid' })
      .populate('courseId', 'title category')
      .select('courseId certificateNumber verificationId issueDate status metadata')
      .sort({ issueDate: -1 })
      .lean(),
    Course.find({})
      .select('title category difficulty stage description tags outcomes modules')
      .lean(),
    Assessment.find({})
      .select('assessmentId title topic description topicsCovered')
      .lean(),
    SkillPassport.findOne({ studentId: String(studentId) }).select('projects').lean(),
  ]);

  const assessments = formatAssessmentDefinitions(storedAssessments);
  const assessmentsById = new Map(
    assessments.map((assessment) => [assessment.assessmentId, assessment])
  );
  const skillEvidence = new Map(SKILLS.map((skill) => [skill.id, []]));
  const skillScores = new Map(SKILLS.map((skill) => [skill.id, []]));

  practiceSessions.forEach((session) => {
    const score = Number(session.accuracyPercentage);
    if (!Number.isFinite(score) || score < 0 || score > 100) return;

    const topic = normalizeText([session.topic]);
    SKILLS.filter((skill) => matchesSkill(skill, topic)).forEach((skill) => {
      skillScores.get(skill.id).push(score);
      skillEvidence.get(skill.id).push(
        toEvidence({
          id: session.sessionId,
          type: 'practice',
          title: `${session.topic} practice`,
          description: `${score}% accuracy`,
          date: session.completedAt || session.updatedAt || session.createdAt,
          score,
          href: '/student/practice',
        })
      );
    });
  });

  assessmentAttempts.forEach((attempt) => {
    const score = Number(attempt.percentage);
    const assessment = assessmentsById.get(attempt.assessmentId);
    if (!assessment || !Number.isFinite(score) || score < 0 || score > 100) return;

    const assessmentText = normalizeText([
      assessment.title,
      assessment.topic,
      assessment.description,
      assessment.topicsCovered,
    ]);

    SKILLS.filter((skill) => matchesSkill(skill, assessmentText)).forEach((skill) => {
      skillScores.get(skill.id).push(score);
      skillEvidence.get(skill.id).push(
        toEvidence({
          id: attempt.attemptId,
          type: 'assessment',
          title: assessment.title,
          description: `${score}% assessment score`,
          date: attempt.completedAt || attempt.updatedAt || attempt.createdAt,
          score,
          href: `/student/assessments/${assessment.assessmentId}`,
        })
      );
    });
  });

  enrollments.forEach((enrollment) => {
    const course = enrollment.courseId;
    if (!course || (!enrollment.progressPercentage && enrollment.status !== 'completed')) return;

    const courseText = getCourseSearchText(course);
    SKILLS.filter((skill) => matchesSkill(skill, courseText)).forEach((skill) => {
      skillEvidence.get(skill.id).push(
        toEvidence({
          id: enrollment._id,
          type: 'course',
          title: course.title,
          description:
            enrollment.status === 'completed'
              ? 'Course completed'
              : `${enrollment.progressPercentage}% course progress`,
          date: enrollment.updatedAt || enrollment.createdAt,
          href: `/student/courses/${course._id}`,
        })
      );
    });
  });

  const passportProjects = (skillPassport?.projects || []).filter(
    (project) => project.title?.trim()
  );
  passportProjects.forEach((project, index) => {
    const projectText = normalizeText([
      project.title,
      project.description,
      project.techStack,
    ]);
    SKILLS.filter((skill) => matchesSkill(skill, projectText)).forEach((skill) => {
      skillEvidence.get(skill.id).push(
        toEvidence({
          id: project._id || `${project.title}-${index}`,
          type: 'project',
          title: project.title,
          description: project.description || (project.techStack || []).join(', '),
          href: project.githubUrl || null,
        })
      );
    });
  });

  certificates.forEach((certificate) => {
    const title = certificate.metadata?.courseTitle || certificate.courseId?.title;
    const certificateText = normalizeText([
      title,
      certificate.courseId?.category,
    ]);
    SKILLS.filter((skill) => matchesSkill(skill, certificateText)).forEach((skill) => {
      skillEvidence.get(skill.id).push(
        toEvidence({
          id: certificate._id,
          type: 'certificate',
          title: title || 'Course certificate',
          description: `${certificate.metadata?.issuingOrganization || 'FinTrack Edu'} certificate`,
          date: certificate.issueDate,
          href: `/verify/${certificate.verificationId}`,
        })
      );
    });
  });

  const skills = SKILLS.map((definition) => {
    const score = average(skillScores.get(definition.id));
    const evidence = skillEvidence.get(definition.id);

    return {
      ...definition,
      score,
      level: score === null ? null : getLevel(score),
      assessed: score !== null,
      evidenceCount: evidence.length,
      evidence,
    };
  });

  const assessedSkills = skills.filter((skill) => skill.assessed);
  const overallScore = average(assessedSkills.map((skill) => skill.score));
  const courseRecommendations = courses.map((course) => ({
    course,
    searchText: getCourseSearchText(course),
  }));
  const recommendations = skills
    .filter((skill) => skill.score === null || skill.score < 80)
    .map((skill) => {
      const matchedCourse = courseRecommendations.find(({ searchText }) =>
        matchesSkill(skill, searchText)
      )?.course;
      const actions = [
        {
          type: 'course',
          title: matchedCourse ? `Continue: ${matchedCourse.title}` : `Browse courses for ${skill.name}`,
          href: matchedCourse ? `/student/courses/${matchedCourse._id}` : '/student/courses',
        },
      ];

      const matchedAssessment = assessments.find((assessment) =>
        matchesSkill(
          skill,
          normalizeText([
            assessment.title,
            assessment.topic,
            assessment.description,
            assessment.topicsCovered,
          ])
        )
      );
      if (matchedAssessment) {
        actions.push({
          type: 'assessment',
          title: `Take: ${matchedAssessment.title}`,
          href: `/student/assessments/${matchedAssessment.assessmentId}`,
        });
      }

      if (skill.id === 'fintech-fundamentals') {
        actions.push({
          type: 'practice',
          title: 'Try a FinTech practice set',
          href: '/student/practice',
        });
      }

      return {
        skillId: skill.id,
        skill: skill.name,
        score: skill.score,
        activityCount: actions.length,
        reason:
          skill.score === null
            ? 'There is no completed assessment or practice evidence for this skill yet.'
            : `Your current evidence averages ${skill.score}%. Build this skill further with a focused learning activity.`,
        actions,
      };
    })
    .sort(
      (left, right) =>
        right.activityCount - left.activityCount ||
        (left.score ?? -1) - (right.score ?? -1)
    )
    .slice(0, 3)
    .map(({ score, activityCount, ...recommendation }) => recommendation);

  const passportCertificates = certificates.map((certificate) => ({
    id: String(certificate._id),
    title: certificate.metadata?.courseTitle || certificate.courseId?.title || 'Course certificate',
    issuer: certificate.metadata?.issuingOrganization || 'FinTrack Edu',
    issueDate: certificate.issueDate,
    verificationUrl: `/verify/${certificate.verificationId}`,
  }));

  const passportSkills = assessedSkills.map((skill) => ({
    id: skill.id,
    skill: skill.name,
    proficiency: skill.score,
    level: skill.level,
    verificationSource: [
      ...new Set(
        skill.evidence
          .filter((evidence) => evidence.type === 'assessment' || evidence.type === 'practice')
          .map((evidence) => (evidence.type === 'assessment' ? 'Assessment' : 'Practice results'))
      ),
    ].join(' and '),
  }));

  return {
    summary: {
      overallScore,
      assessedSkillCount: assessedSkills.length,
      totalSkillCount: SKILLS.length,
      strengths: skills
        .filter((skill) => skill.score !== null && skill.score >= 80)
        .map(({ id, name, score, level }) => ({ id, name, score, level })),
      skillGaps: skills
        .filter((skill) => skill.score !== null && skill.score < 60)
        .map(({ id, name, score, level }) => ({ id, name, score, level })),
    },
    skills,
    recommendations,
    passport: {
      skills: passportSkills,
      certificates: passportCertificates,
      projects: passportProjects.map((project, index) => ({
        id: String(project._id || `${project.title}-${index}`),
        title: project.title,
        description: project.description || '',
        techStack: project.techStack || [],
        githubUrl: project.githubUrl || '',
      })),
    },
  };
};
