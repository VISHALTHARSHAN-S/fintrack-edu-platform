import API from './api';

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || error.message || fallbackMessage;

export const fetchStudentSkillSummary = async () => {
  try {
    const response = await API.get('/student/skills');
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load your skill summary.'));
  }
};

export const fetchStudentSkillDetails = async (skillId) => {
  try {
    const response = await API.get(`/student/skills/${encodeURIComponent(skillId)}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load skill evidence.'));
  }
};
