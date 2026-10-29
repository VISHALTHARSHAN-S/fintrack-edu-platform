import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

const allowedFileTypes = new Map([
  ['.pdf', 'application/pdf'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
]);

const storage = cloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'fintrack-edu/support-tickets',
        resource_type: 'auto',
        public_id: () => randomUUID(),
      },
    })
  : undefined;

const upload = storage
  ? multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (allowedFileTypes.get(extension) !== file.mimetype) {
          return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'attachment'));
        }
        return callback(null, true);
      },
    })
  : null;

export const uploadSupportTicketAttachment = (req, res, next) => {
  if (!req.isDbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Help & Support requires a connected database. Please try again later.',
    });
  }
  if (!req.is('multipart/form-data')) return next();
  if (!upload) {
    return res.status(503).json({
      success: false,
      message: 'File uploads are not configured on the server. Submit the request without an attachment.',
    });
  }

  return upload.single('attachment')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Attachment size must be 5 MB or less.' });
    }
    if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, message: 'Attach one PNG, JPEG, WebP, or PDF file.' });
    }
    console.error('[Support Ticket Upload Error]', error);
    return res.status(400).json({ success: false, message: 'Unable to upload this attachment.' });
  });
};
