import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Media from '../models/media.model.js';
import { uploadToCloudinary ,deleteFromCloudinary} from '../services/cloudinary.service.js';
import bcrypt from 'bcryptjs';
// import cloudinary from "../config/cloudinary.js";

// --- Get Profile ---
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('profilePhoto');
  res.json(user);
});

// --- Update Personal Info ---
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, district, taluka, language } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, {
    fullName,
    address: { district, taluka },
    language,
  }, { new: true });
  res.json(user);
});

// --- Upload Profile Picture ---
// --- Upload/Update Profile Picture ---
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const user = await User.findById(req.user.id);

  // If user already has a photo, delete the old one from Cloudinary
  if (user.profilePhoto) {
    const oldMedia = await Media.findById(user.profilePhoto);
    if (oldMedia && oldMedia.publicId) {
      await deleteFromCloudinary(oldMedia.publicId);
      await oldMedia.deleteOne();
    }
  }

  // Upload the new file to Cloudinary
  const result = await uploadToCloudinary(req.file, 'profile_photos');

  // Create a new media document in MongoDB
  const media = await Media.create({
    url: result.secure_url,
    publicId: result.public_id,
    uploadedBy: req.user.id,
    contentType: req.file.mimetype,
    size: req.file.size,
  });

  // Link the new media to the user and save
  user.profilePhoto = media._id;
  await user.save();

  res.json({ message: 'Profile photo updated successfully', user });
});

// --- Delete Profile Photo ---
export const deleteProfilePhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.profilePhoto) {
    return res.status(400).json({ message: 'No profile photo to delete' });
  }

  const media = await Media.findById(user.profilePhoto);

  // Delete from Cloudinary and then from MongoDB
  if (media && media.publicId) {
    await deleteFromCloudinary(media.publicId);
    await media.deleteOne();
  }

  user.profilePhoto = undefined;
  await user.save();

  res.json({ message: 'Profile photo deleted successfully', user });
});


// --- Change Password ---
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

  user.passwordHash = newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully' });
});
