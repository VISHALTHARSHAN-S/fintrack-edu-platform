import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Settings } from '../models/Settings.js';

const requireDatabase = (req, res) => {
  if (!req.isDbConnected) {
    res.status(503).json({ success: false, message: 'Student settings require a connected database.' });
    return false;
  }
  return true;
};

const validProfileFields = new Set(['name', 'phone', 'avatar', 'bio']);

const validateAvatar = (avatar) => {
  if (avatar === '') return true;
  try {
    return new URL(avatar).protocol === 'https:';
  } catch {
    return false;
  }
};

export const getStudentSettingsProfile = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({ success: false, message: 'The authenticated account is invalid.' });
    }

    const [user, studentProfile] = await Promise.all([
      User.findById(req.user.id),
      StudentProfile.findOne({ userId: req.user.id }).select('institution degree yearOfStudy fieldOfStudy bio'),
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'Student account not found.' });

    return res.json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.createdAt,
          requiresCurrentPassword: Boolean(user.passwordHash),
        },
        studentProfile: studentProfile
          ? {
              institution: studentProfile.institution,
              degree: studentProfile.degree,
              yearOfStudy: studentProfile.yearOfStudy,
              fieldOfStudy: studentProfile.fieldOfStudy,
              bio: studentProfile.bio,
            }
          : { institution: '', degree: '', yearOfStudy: '', fieldOfStudy: '', bio: '' },
      },
    });
  } catch (error) {
    console.error('[Student Settings Profile Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load your profile settings.' });
  }
};

export const updateStudentSettingsProfile = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const entries = Object.entries(req.body || {});
    if (
      entries.length === 0 ||
      entries.some(([key]) => !validProfileFields.has(key))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide only supported profile fields: name, phone, avatar, and bio.',
      });
    }

    const { name, phone, avatar, bio } = req.body;
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80)) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters.' });
    }
    if (
      phone !== undefined &&
      (typeof phone !== 'string' || phone.length > 32 || !/^[+()\d.\-\s]*$/.test(phone))
    ) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number.' });
    }
    if (avatar !== undefined && (typeof avatar !== 'string' || avatar.length > 2048 || !validateAvatar(avatar))) {
      return res.status(400).json({ success: false, message: 'Profile photo must be a valid HTTPS image URL.' });
    }
    if (bio !== undefined && (typeof bio !== 'string' || bio.length > 500)) {
      return res.status(400).json({ success: false, message: 'Bio must be 500 characters or fewer.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Student account not found.' });

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    await user.save();

    let studentProfile = await StudentProfile.findOne({ userId: user._id });
    if (bio !== undefined) {
      studentProfile = await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: { bio: bio.trim() }, $setOnInsert: { userId: user._id } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }

    return res.json({
      success: true,
      message: 'Profile settings saved.',
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.createdAt,
          requiresCurrentPassword: Boolean(user.passwordHash),
        },
        studentProfile: studentProfile
          ? {
              institution: studentProfile.institution,
              degree: studentProfile.degree,
              yearOfStudy: studentProfile.yearOfStudy,
              fieldOfStudy: studentProfile.fieldOfStudy,
              bio: studentProfile.bio,
            }
          : { institution: '', degree: '', yearOfStudy: '', fieldOfStudy: '', bio: '' },
      },
    });
  } catch (error) {
    console.error('[Student Settings Profile Update Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to save your profile settings.' });
  }
};

export const updateStudentPassword = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const entries = Object.keys(req.body || {});
    if (
      entries.some((key) => !['currentPassword', 'newPassword'].includes(key)) ||
      typeof req.body?.newPassword !== 'string'
    ) {
      return res.status(400).json({ success: false, message: 'Provide a valid new password.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: 'New password must be between 8 and 128 characters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Student account not found.' });

    if (user.passwordHash) {
      if (typeof currentPassword !== 'string' || !currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required.' });
      }
      if (!(await user.matchPassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
    }

    user.passwordHash = newPassword;
    if (user.authProvider === 'google') user.authProvider = 'local_google';
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[Student Password Update Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to update your password.' });
  }
};

export const getStudentTheme = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const settings = await Settings.findOne({ userId: req.user.id }).select('theme').lean();
    return res.json({ success: true, data: { theme: settings?.theme === 'dark' ? 'dark' : 'light' } });
  } catch (error) {
    console.error('[Student Theme Read Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load your appearance settings.' });
  }
};

export const updateStudentTheme = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    if (
      Object.keys(req.body || {}).length !== 1 ||
      !['light', 'dark'].includes(req.body?.theme)
    ) {
      return res.status(400).json({ success: false, message: 'Theme must be either light or dark.' });
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { theme: req.body.theme }, $setOnInsert: { userId: req.user.id } },
      { new: true, upsert: true, runValidators: true }
    ).select('theme');
    return res.json({ success: true, message: 'Appearance settings saved.', data: { theme: settings.theme } });
  } catch (error) {
    console.error('[Student Theme Update Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to save your appearance settings.' });
  }
};
