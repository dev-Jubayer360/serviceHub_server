const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a service title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    shortDescription: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Please add a base price'],
    },
    serviceType: {
      type: String,
      enum: ['Fixed Price', 'Hourly Rate', 'Varies by Project'],
      default: 'Fixed Price',
    },
    duration: {
      type: String, // e.g. '2 Hours'
    },
    locationCoverage: {
      type: String,
      enum: ['Anywhere in City', 'Specific Areas', 'My Workshop Only'],
      default: 'Anywhere in City',
    },
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
