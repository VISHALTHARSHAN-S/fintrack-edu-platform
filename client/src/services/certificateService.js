import API from './api';

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Certificate request failed.';

export const fetchCertificates = async () => {
  try {
    const response = await API.get('/certificates');
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const fetchCertificateEligibility = async () => {
  try {
    const response = await API.get('/certificates/eligible');
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const issueCourseCertificate = async (courseId) => {
  try {
    const response = await API.post(`/certificates/courses/${courseId}/issue`);
    return response.data.data;
  } catch (error) {
    const missing = error.response?.data?.missingAssessmentIds;
    const message = getErrorMessage(error);
    throw new Error(missing?.length ? `${message} Required: ${missing.join(', ')}` : message);
  }
};

export const downloadCertificatePdf = async (certificateId, certificateNumber) => {
  try {
    const response = await API.get(`/certificates/${certificateId}/pdf`, {
      responseType: 'blob',
    });
    const fileUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyCertificate = async (verificationId) => {
  try {
    const response = await API.get(`/certificates/verify/${encodeURIComponent(verificationId)}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
