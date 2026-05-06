import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    shortUrl: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    clicks: {
      type: Number,
      default: 0
    },
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Url = mongoose.model('Url', urlSchema);
