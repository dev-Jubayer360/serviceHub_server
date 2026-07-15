const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding Demo Users');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDemoUsers = async () => {
  try {
    await connectDB();
    
    const demoUsers = [
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: '123456',
        role: 'admin',
        isEmailVerified: true,
        provider: 'credentials'
      },
      {
        name: 'Demo Provider',
        email: 'provider@demo.com',
        password: '123456',
        role: 'provider',
        isEmailVerified: true,
        provider: 'credentials'
      },
      {
        name: 'Demo User',
        email: 'user@demo.com',
        password: '123456',
        role: 'customer',
        isEmailVerified: true,
        provider: 'credentials'
      }
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const user = new User(userData);
        await user.save();
        console.log(`${userData.role} seeded successfully!`);
      } else {
        console.log(`${userData.role} already exists!`);
      }
    }

    console.log('Demo users seeding completed!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding demo users: ${error}`);
    process.exit(1);
  }
};

seedDemoUsers();
