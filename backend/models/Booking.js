const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      default: () => 'BK' + Date.now().toString(36).toUpperCase(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    travelDate:    { type: Date, required: true },
    returnDate:    { type: Date },
    numberOfPeople: {
      type: Number,
      required: true,
      min: [1, 'At least 1 person'],
      max: [20, 'Max 20 people per booking'],
    },
    pricePerPerson: { type: Number, required: true },
    taxAmount:      { type: Number, default: 0 },
    totalAmount:    { type: Number, required: true },
    currency:       { type: String, default: 'INR' },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentRef:  { type: String },
    notes:       { type: String, maxlength: 500 },
    travellers: [{
      name:     { type: String },
      age:      { type: Number },
      passport: { type: String },
    }],
    cancelledAt:   { type: Date },
    cancelReason:  { type: String },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// ── Auto-compute tax & total before save ─────────────────
bookingSchema.pre('save', function (next) {
  if (this.isModified('pricePerPerson') || this.isModified('numberOfPeople')) {
    const subtotal   = this.pricePerPerson * this.numberOfPeople;
    this.taxAmount   = Math.round(subtotal * 0.18);
    this.totalAmount = subtotal + this.taxAmount;
  }
  next();
});

// ── Method: cancel booking ────────────────────────────────
bookingSchema.methods.cancel = async function (reason = '') {
  this.bookingStatus = 'cancelled';
  this.cancelledAt   = new Date();
  this.cancelReason  = reason;
  await this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
