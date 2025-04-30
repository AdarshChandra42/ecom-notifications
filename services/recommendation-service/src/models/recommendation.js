// Recommendation model
import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['purchase_history', 'browsing_activity', 'similar_users', 'trending'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Create compound index for efficient queries
recommendationSchema.index({ userId: 1, score: -1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Recommendation = mongoose.model('Recommendation', recommendationSchema);
