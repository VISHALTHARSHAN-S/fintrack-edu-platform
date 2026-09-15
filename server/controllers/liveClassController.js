import {
  listStudentLiveClasses,
  getLiveClassDetail,
  joinLiveClassForStudent,
  leaveLiveClassForStudent,
  getRecordingForClass,
} from '../services/liveClassService.js';

export const getStudentLiveClasses = async (req, res) => {
  try {
    const classes = await listStudentLiveClasses(req.user.id, req.isDbConnected);
    return res.json({ success: true, data: classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentLiveClassDetails = async (req, res) => {
  try {
    const { classId } = req.params;
    const liveClass = await getLiveClassDetail(classId, req.isDbConnected);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found.' });
    }

    return res.json({ success: true, data: liveClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const joinLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await joinLiveClassForStudent(req.user.id, classId, req.isDbConnected);

    if (!result.success) {
      return res.status(result.message.includes('not found') ? 404 : 400).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const leaveLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await leaveLiveClassForStudent(req.user.id, classId, req.isDbConnected);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLiveClassRecording = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await getRecordingForClass(classId, req.isDbConnected);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
