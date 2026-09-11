import { SEEDED_MESSAGES } from '../seed/mentorSeedData.js';

// Get Conversations List
export const getConversations = async (req, res) => {
  try {
    const list = SEEDED_MESSAGES.map((conv) => ({
      conversationId: conv.conversationId,
      studentId: conv.studentId,
      studentName: conv.studentName,
      studentAvatar: conv.studentAvatar,
      onlineStatus: conv.onlineStatus,
      unreadCount: conv.unreadCount,
      lastMessageTime: conv.lastMessageTime,
      lastMessage: conv.messages[conv.messages.length - 1]?.text || '',
    }));

    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Message History for a conversation
export const getMessageHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const conv =
      SEEDED_MESSAGES.find((c) => c.studentId === studentId) || SEEDED_MESSAGES[0];

    // Mark as read
    conv.unreadCount = 0;

    return res.json({
      success: true,
      data: conv,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { studentId, text } = req.body;

    const conv = SEEDED_MESSAGES.find((c) => c.studentId === studentId) || SEEDED_MESSAGES[0];
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: 'mentor_1',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    conv.messages.push(newMsg);
    conv.lastMessageTime = 'Just now';

    return res.json({
      success: true,
      data: newMsg,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
