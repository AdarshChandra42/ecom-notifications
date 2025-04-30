// Notification model using Mongoose
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['promotion', 'order_update', 'recommendation']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
notificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
