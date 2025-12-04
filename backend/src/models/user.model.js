import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['farmer', 'admin', 'agronomist'],
    },
    profilePhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // ✅ Default valid coordinates
      },
    },
    address: {
      district: { type: String, trim: true },
      taluka: { type: String, trim: true },
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'mr'],
    },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ✅ Compare passwords for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

// ✅ Geospatial index
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
export default User;
