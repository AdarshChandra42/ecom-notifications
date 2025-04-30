// Utility to generate mock data for testing
import { Product } from '../models/product.js';

export const generateMockProducts = async (count = 50) => {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Beauty', 'Sports', 'Toys'];
  const products = [];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = (Math.random() * 500 + 10).toFixed(2);
    
    products.push({
      productId: `PROD${i.toString().padStart(4, '0')}`,
      name: `${category} Item ${i}`,
      category,
      price: parseFloat(price),
      description: `This is a great ${category.toLowerCase()} product with many features.`,
      imageUrl: `https://example.com/images/products/${category.toLowerCase()}${i}.jpg`,
      attributes: {
        color: ['Red', 'Blue', 'Green', 'Black', 'White'][Math.floor(Math.random() * 5)],
        weight: Math.floor(Math.random() * 5 + 1),
        rating: Math.floor(Math.random() * 5 + 1)
      }
    });
  }
  
  // Clear existing products and insert new mock data
  await Product.deleteMany({});
  await Product.insertMany(products);
  
  console.log(`Generated ${products.length} mock products`);
  return products;
};
