import API from './api';
import { MOCK_MESSAGES_DATA } from '../data/mockMentorData';

export const fetchConversations = async () => {
  try {
    const res = await API.get('/mentor/messages/conversations');
    return res.data.data;
  } catch (error) {
    return MOCK_MESSAGES_DATA.map((conv) => ({
      conversationId: conv.conversationId,
      studentId: conv.studentId,
      studentName: conv.studentName,
      studentAvatar: conv.studentAvatar,
      onlineStatus: conv.onlineStatus,
      unreadCount: conv.unreadCount,
      lastMessageTime: conv.lastMessageTime,
      lastMessage: conv.messages[conv.messages.length - 1]?.text || '',
    }));
  }
};

export const fetchMessageHistory = async (studentId) => {
  try {
    const res = await API.get(`/mentor/messages/thread/${studentId}`);
    return res.data.data;
  } catch (error) {
    const conv = MOCK_MESSAGES_DATA.find((c) => c.studentId === studentId) || MOCK_MESSAGES_DATA[0];
    conv.unreadCount = 0;
    return conv;
  }
};

export const sendMessageApi = async (studentId, text) => {
  try {
    const res = await API.post('/mentor/messages/send', { studentId, text });
    return res.data.data;
  } catch (error) {
    const conv = MOCK_MESSAGES_DATA.find((c) => c.studentId === studentId) || MOCK_MESSAGES_DATA[0];
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: 'mentor_1',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    conv.messages.push(newMsg);
    conv.lastMessageTime = 'Just now';
    return newMsg;
  }
};
