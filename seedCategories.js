const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const MOCK_CATEGORIES = [
  { name: 'Home Cleaning', slug: 'home-cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop', description: 'Professional cleaning services for your home.' },
  { name: 'Electrical', slug: 'electrical', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop', description: 'Expert electricians for repairs and installations.' },
  { name: 'Plumbing', slug: 'plumbing', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=200&auto=format&fit=crop', description: 'Reliable plumbing services for leaks and installations.' },
  { name: 'AC Repair', slug: 'ac-repair', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=200&auto=format&fit=crop', description: 'Air conditioning repair, maintenance, and installation.' },
  { name: 'Photography', slug: 'photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&auto=format&fit=crop', description: 'Professional photographers for events and portraits.' },
  { name: 'Tutoring', slug: 'tutoring', image: 'https://images.unsplash.com/photo-1427504494785-319ce51d1541?q=80&w=200&auto=format&fit=crop', description: 'Experienced tutors for all subjects and grades.' },
  { name: 'Web Dev', slug: 'web-dev', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=200&auto=format&fit=crop', description: 'Freelance web developers for your next project.' },
  { name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=200&auto=format&fit=crop', description: 'At-home beauty and salon services.' },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Connected...');

    // Clear existing categories to avoid duplicates
    // await Category.deleteMany();

    for (const cat of MOCK_CATEGORIES) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created: ${cat.name}`);
      } else {
        console.log(`Skipped existing: ${cat.name}`);
      }
    }

    console.log('Database Seeding Completed!');
    process.exit();
  } catch (error) {
    console.error('Error with database seeding', error);
    process.exit(1);
  }
};

seedCategories();
