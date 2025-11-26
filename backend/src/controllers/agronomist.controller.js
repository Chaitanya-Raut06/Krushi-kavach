import asyncHandler from 'express-async-handler';
import AgronomistProfile from '../models/agronomistProfile.model.js';
import User from '../models/user.model.js';
import Location from '../models/location.model.js';

// --- Get Agronomist Profile ---
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await AgronomistProfile.findOne({ user: req.user.id }).populate('user');
  res.json(profile);
});

// --- Update Professional Info ---
export const updateProfile = asyncHandler(async (req, res) => {
  const { qualification, experience, availability, bio } = req.body;
  const profile = await AgronomistProfile.findOneAndUpdate(
    { user: req.user.id },
    { qualification, experience, availability, bio },
    { new: true }
  ).populate('user');
  res.json(profile);
});

// --- Admin: Verify / Reject Agronomist ---
export const verifyAgronomist = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'verified' or 'rejected'
  const profile = await AgronomistProfile.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user');
  res.json(profile);
});

// Add this to your existing agronomist.controller.js

// --- Find Local Experts for Farmer ---
export const findLocalExperts = asyncHandler(async (req, res) => {
  // 1. Get the logged-in farmer's taluka from their profile
  const farmer = await User.findById(req.user.id);
  if (!farmer || !farmer.address.taluka) {
    return res.status(400).json({ message: "Farmer's location (taluka) not found in profile." });
  }
  const farmerTaluka = farmer.address.taluka;

  // 2. Find verified and available agronomist PROFILES first
  const expertProfiles = await AgronomistProfile.find({
    status: 'verified',
    availability: 'available',
  }).populate({
    path: 'user', // Populate the user details for each profile
    match: { 'address.taluka': farmerTaluka }, // Only populate users that match the farmer's taluka
    select: 'fullName mobileNumber profilePhoto address' // Select only the fields you need
  });

  // 3. Filter out any profiles where the user did not match the location
  //    and format the response for the frontend.
  const availableExperts = expertProfiles
    .filter(profile => profile.user) // Keep only profiles where a matching user was found and populated
    .map(profile => ({
      id: profile._id, // Agronomist Profile ID
      user: profile.user,
      qualification: profile.qualification,
      experience: profile.experience,
      bio: profile.bio,
    }));

  res.json(availableExperts);
});