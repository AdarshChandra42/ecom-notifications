// Mock Product model for recommendations
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

productSchema.index({ category: 1, price: 1 });

export const Product = mongoose.model('Product', productSchema);
