const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.ObjectId,
      ref: 'Service',
      required: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
    },
    address: {
      addressLine1: String,
      city: String,
      phone: String,
    },
    transactionId: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
