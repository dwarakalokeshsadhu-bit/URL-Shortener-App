import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      index: true
    },
    plan: {
      type: String,
      enum: ['free', 'creator', 'business'],
      default: 'free'
    },
    billingStatus: {
      type: String,
      enum: ['none', 'pending', 'active'],
      default: 'none'
    },
    billingDetails: {
      fullName: String,
      email: String,
      phone: String,
      company: String,
      taxId: String,
      address: String,
      selectedPlan: String,
      paymentReference: String,
      updatedAt: Date
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
