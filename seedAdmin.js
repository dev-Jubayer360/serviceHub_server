const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('MongoDB Connected');

    const adminEmail = 'admin@servicehub.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin already exists in the database');
      if (adminExists.role !== 'admin') {
         adminExists.role = 'admin';
         await adminExists.save();
         console.log('Updated existing user to admin role');
      }
      process.exit();
    }

    const adminUser = new User({
      name: 'System Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      provider: 'credentials'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
