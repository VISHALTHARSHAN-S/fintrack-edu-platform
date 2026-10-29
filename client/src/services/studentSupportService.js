import API from './api';

const request = async (promise, fallback) => {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback);
  }
};

export const fetchSupportTickets = (params = {}) =>
  request(API.get('/student/support/tickets', { params }), 'Unable to load your support requests.');
export const createSupportTicket = (ticket) => {
  if (!ticket.attachment) {
    const payload = Object.fromEntries(
      Object.entries(ticket).filter(([key]) => key !== 'attachment')
    );
    return request(API.post('/student/support/tickets', payload), 'Unable to submit your support request.');
  }
  const formData = new FormData();
  Object.entries(ticket).forEach(([key, value]) => {
    if (key !== 'attachment') formData.append(key, value);
  });
  formData.append('attachment', ticket.attachment);
  return request(
    API.post('/student/support/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    'Unable to submit your support request.'
  );
};
export const fetchSupportTicket = (ticketId) =>
  request(
    API.get(`/student/support/tickets/${encodeURIComponent(ticketId)}`),
    'Unable to load this support request.'
  );
export const replyToSupportTicket = (ticketId, message) =>
  request(
    API.post(`/student/support/tickets/${encodeURIComponent(ticketId)}/replies`, { message }),
    'Unable to send your reply.'
  );
export const reopenSupportTicket = (ticketId) =>
  request(
    API.post(`/student/support/tickets/${encodeURIComponent(ticketId)}/reopen`),
    'Unable to reopen your support request.'
  );
