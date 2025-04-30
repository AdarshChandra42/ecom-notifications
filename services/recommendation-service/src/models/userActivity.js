// User activity model for tracking browsing behavior
import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['view', 'search', 'add_to_cart', 'wishlist'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ productId: 1, activityType: 1 });

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);
