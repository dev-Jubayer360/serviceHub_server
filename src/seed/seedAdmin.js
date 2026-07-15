const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

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

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminEmail = 'admin@nexligadget.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin already exists!');
      process.exit();
    }

    const adminUser = new User({
      name: 'Super Admin',
      email: adminEmail,
      password: 'Admin@12345',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding admin: ${error}`);
    process.exit(1);
  }
};

seedAdmin();
