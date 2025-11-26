import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Media from '../models/media.model.js';
import AgronomistProfile from '../models/agronomistProfile.model.js';
import Location from '../models/location.model.js';

// --- List All Farmers ---
export const listFarmers = asyncHandler(async (req, res) => {
  const farmers = await User.find({ role: 'farmer' });
  res.json(farmers);
});

// --- List All Agronomists ---
export const listAgronomists = asyncHandler(async (req, res) => {
  // Chain all .populate() calls together in a single statement
  const agronomists = await AgronomistProfile.find()
    .populate('user', 'fullName mobileNumber address') // Populates specific fields from the user document
    .populate('idProof', 'url');                      // Populates the URL from the idProof media document

  res.status(200).json(agronomists);
});

// --- Assign Locations to Agronomist ---
export const assignLocations = asyncHandler(async (req, res) => {
  // 1. Expect an array of location objects, not IDs.
  const { locations } = req.body; // e.g., [{ district: 'Pune', taluka: 'Haveli' }]

  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    return res.status(400).json({ message: 'Please provide a valid array of locations.' });
  }

  const agronomist = await User.findById(req.params.id);

  if (!agronomist) {
    return res.status(404).json({ message: 'Agronomist not found with this ID' });
  }

  // 2. Create a query to find all matching locations in a single database call.
  const locationQuery = locations.map(loc => ({
    district: loc.district,
    taluka: loc.taluka,
  }));

  const foundLocations = await Location.find({ $or: locationQuery });

  // 3. Error handling: Check if all requested locations were found.
  if (foundLocations.length !== locations.length) {
    return res.status(404).json({
      message: 'One or more specified locations do not exist. Please create them first.',
    });
  }

  // 4. Extract the _id from each found location document.
  const locationIds = foundLocations.map(loc => loc._id);

  // 5. Assign the array of ObjectIDs to the agronomist.
  agronomist.assignedLocations = locationIds;
  await agronomist.save();

  res.json(agronomist);
});
