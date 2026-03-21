const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String },
    category: { type: String, enum: ['beach', 'mountain', 'city', 'cultural', 'adventure', 'luxury'], required: true },
    badge: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    coverImage: { type: String },
    estimatedCost: { type: Number, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    crowdLevel: { type: Number, default: 0 },
    duration: { type: String },
    bestSeason: { type: String },
    tags: [{ type: String }],
    touristSpots: [{ name: String, icon: String, description: String }],
    restaurants: [{ type: String }],
    hotels: [{ type: String }],
    activities: [{ type: String }],
    itinerary: [{ day: String, title: String, activities: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Destination', destinationSchema);