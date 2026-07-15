const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.ObjectId,
      ref: 'Service',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only favourite a service once
favouriteSchema.index({ user: 1, service: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
