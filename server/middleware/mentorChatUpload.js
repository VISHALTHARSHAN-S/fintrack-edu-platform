import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
]);

const storage = cloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'fintrack-edu/mentor-chat',
        resource_type: 'auto',
        public_id: (request, file) => `message_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)}`,
      },
    })
  : undefined;

const upload = storage
  ? multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (request, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
          return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
        }
        return callback(null, true);
      },
    })
  : null;

export const requireCloudinary = (request, response, next) => {
  if (!cloudinaryConfigured) {
    return response.status(503).json({ success: false, message: 'File sharing is not configured on the server.' });
  }
  return next();
};

export const uploadMentorChatFile = (request, response, next) => {
  if (!upload) return requireCloudinary(request, response, next);
  return upload.single('file')(request, response, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return response.status(400).json({ success: false, message: 'File size must be 10 MB or less.' });
    }
    if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
      return response.status(400).json({ success: false, message: 'Unsupported file type.' });
    }
    return response.status(400).json({ success: false, message: 'Unable to upload this file.' });
  });
};