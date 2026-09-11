export const getNotifications = async (req, res) => {
  try {
    const notifications = [
      {
        id: 'notif-1',
        title: 'New Mentor Session Scheduled',
        message: 'Your live HFT backtesting session with Dr. Aris Vance is confirmed for 6:00 PM.',
        type: 'info',
        time: '10 mins ago',
        isRead: false,
      },
      {
        id: 'notif-2',
        title: 'Micro-Credential Issued',
        message: 'Congratulations! You earned the Algorithmic Trading Foundations Badge.',
        type: 'success',
        time: '2 hours ago',
        isRead: false,
      },
      {
        id: 'notif-3',
        title: 'Recruiter Viewed Your Skill Passport',
        message: 'Nexus Financial Solutions viewed your Quant Engineer skill score.',
        type: 'info',
        time: 'Yesterday',
        isRead: true,
      },
    ];

    return res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    return res.json({ success: true, message: `Notification ${id} marked as read` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
