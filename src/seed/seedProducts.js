const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const generateSlug = require('../utils/generateSlug');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();

    const category = await Category.create({
      name: 'Smartphones',
      slug: generateSlug('Smartphones'),
    });

    const brand = await Brand.create({
      name: 'Apple',
      slug: generateSlug('Apple'),
    });

    const products = [
      {
        name: 'iPhone 15 Pro Max',
        slug: generateSlug('iPhone 15 Pro Max'),
        category: category._id,
        brand: brand._id,
        price: 150000,
        discountPrice: 145000,
        stock: 50,
        shortDescription: 'The latest iPhone 15 Pro Max',
        description: 'Titanium design. A17 Pro chip. 48MP Main camera. Type-C.',
        badge: 'New',
        status: 'Active',
      }
    ];

    await Product.insertMany(products);
    console.log('Sample products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding products: ${error}`);
    process.exit(1);
  }
};

seedProducts();
