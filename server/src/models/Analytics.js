import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ip: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
    default: 'unknown'
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  userAgent: String,
  referrer: String
});

export const Analytics = mongoose.model('Analytics', analyticsSchema);
