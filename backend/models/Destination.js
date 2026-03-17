const mongoose = require('mongoose');

const touristSpotSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  icon:        { type: String, default: '📍' },
  image:       { type: String },
});

const itineraryDaySchema = new mongoose.Schema({
  day:        { type: String },   // "Day 1"
  title:      { type: String },
  activities: { type: String },
});

const destinationSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    country:     { type: String, required: true, trim: true },
    city:        { type: String, trim: true },
    category:    {
      type: String,
      enum: ['beach', 'mountain', 'city', 'cultural', 'adventure', 'luxury'],
      required: true,
    },
    badge:       { type: String },
    description: { type: String, required: true },
    images:      [{ type: String }],
    coverImage:  { type: String },

    // Smart destination data ──────────────────────────────
    touristSpots:  [touristSpotSchema],
    restaurants:   [{ type: String }],
    hotels:        [{ type: String }],
    activities:    [{ type: String }],
    bestSeason:    { type: String },
    itinerary:     [itineraryDaySchema],

    // Pricing & meta ──────────────────────────────────────
    estimatedCost: { type: Number, required: true },   // INR per person
    duration:      { type: String },                   // "5–7 days"
    rating:        { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },
    crowdLevel:    { type: Number, default: 50, min: 0, max: 100 },

    isFeatured:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
    tags:          [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// ── Text search index ─────────────────────────────────────
destinationSchema.index({ name: 'text', country: 'text', description: 'text', tags: 'text' });

// ── Virtual: crowd status label ───────────────────────────
destinationSchema.virtual('crowdStatus').get(function () {
  if (this.crowdLevel <= 40) return 'low';
  if (this.crowdLevel <= 70) return 'moderate';
  return 'busy';
});

module.exports = mongoose.model('Destination', destinationSchema);
