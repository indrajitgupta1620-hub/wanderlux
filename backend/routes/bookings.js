const express = require('express');
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/book-trip', protect, async (req, res) => {
  try {
    const { destinationId, travelDate, numberOfPeople, notes } = req.body;
    if (!destinationId || !travelDate || !numberOfPeople)
      return res.status(400).json({ error: 'destinationId, travelDate and numberOfPeople are required.' });

    const dest = await Destination.findById(destinationId);
    if (!dest) return res.status(404).json({ error: 'Destination not found.' });
    if (new Date(travelDate) <= new Date())
      return res.status(400).json({ error: 'Travel date must be in the future.' });

    const price = dest.estimatedCost * parseInt(numberOfPeople);
    const tax = Math.round(price * 0.18);

    const booking = await Booking.create({
      bookingRef: 'BK' + Date.now().toString(36).toUpperCase(),
      userId: req.user._id,
      destinationId: dest._id,
      destName: dest.name,
      destCountry: dest.country,
      destImage: dest.coverImage,
      travelDate,
      numberOfPeople: parseInt(numberOfPeople),
      pricePerPerson: dest.estimatedCost,
      taxAmount: tax,
      totalAmount: price + tax,
      bookingStatus: 'confirmed',
      paymentStatus: 'unpaid',
      notes: notes || '',
    });

    res.status(201).json({ status: 'success', data: { booking } });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed.' });
  }
});

router.get('/user-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', total: bookings.length, data: { bookings } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

router.get('/bookings/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.userId.toString() !== req.user._id.toString())
      return res.status(404).json({ error: 'Booking not found.' });
    res.json({ status: 'success', data: { booking } });
  } catch (err) {
    res.status(404).json({ error: 'Booking not found.' });
  }
});

router.patch('/bookings/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.userId.toString() !== req.user._id.toString())
      return res.status(404).json({ error: 'Booking not found.' });
    if (booking.bookingStatus === 'cancelled')
      return res.status(400).json({ error: 'Already cancelled.' });

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: 'cancelled', cancelledAt: new Date(), cancelReason: req.body.reason || '' },
      { new: true }
    );
    res.json({ status: 'success', data: { booking: updated } });
  } catch (err) {
    res.status(500).json({ error: 'Cancellation failed.' });
  }
});

module.exports = router;