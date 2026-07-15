const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    heroBanner: {
      title: { type: String, default: 'Up to 30% Off' },
      subtitle: { type: String, default: 'on selected gadgets' },
      description: { type: String, default: 'Experience the next level of technology with our premium collection of smart gadgets.' },
      image: { type: String, default: '' },
      badge: { type: String, default: 'NEW' },
      badgeText: { type: String, default: 'SMART LIVING' },
      buttonText: { type: String, default: 'Shop Now' },
      buttonLink: { type: String, default: '/shop' },
      discountText: { type: String, default: 'BIG SAVINGS!' }
    },
    socialLinks: {
      facebook: { type: String, default: '#' },
      linkedin: { type: String, default: '#' },
      github: { type: String, default: '#' },
    },
    general: {
      platformName: { type: String, default: 'ServiceHub' },
      contactEmail: { type: String, default: 'support@servicehub.com' },
      contactPhone: { type: String, default: '+880 1234 567890' },
      commissionPercentage: { type: Number, default: 10 },
      officeAddress: { type: String, default: '123 Innovation Drive, Dhaka, Bangladesh' },
    },
    seo: {
      metaTitle: { type: String, default: 'ServiceHub - Professional Home Services' },
      metaDescription: { type: String, default: 'Book trusted professionals for your home service needs.' },
      keywords: { type: String, default: 'services, home, repair, cleaning' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
