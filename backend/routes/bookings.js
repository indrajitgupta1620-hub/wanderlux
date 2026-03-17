const express = require('express');
const db = require('../db/jsonDb');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/book-trip', protect, (req, res) => {
  try {
    const { destinationId, travelDate, numberOfPeople, notes } = req.body;
    if (!destinationId || !travelDate || !numberOfPeople)
      return res.status(400).json({ error: 'destinationId, travelDate and numberOfPeople are required.' });
    const dest = db.findById('destinations', destinationId);
    if (!dest) return res.status(404).json({ error: 'Destination not found.' });
    if (new Date(travelDate) <= new Date())
      return res.status(400).json({ error: 'Travel date must be in the future.' });

    const price = dest.estimatedCost * parseInt(numberOfPeople);
    const tax = Math.round(price * 0.18);
    const booking = db.insert('bookings', {
      bookingRef: 'BK' + Date.now().toString(36).toUpperCase(),
      userId: req.user._id,
      destinationId,
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
  } catch (err) { res.status(500).json({ error: 'Booking failed.' }); }
});

router.get('/user-bookings', protect, (req, res) => {
  const bookings = db.find('bookings', { userId: req.user._id })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ status: 'success', total: bookings.length, data: { bookings } });
});

router.get('/bookings/:id', protect, (req, res) => {
  const booking = db.findById('bookings', req.params.id);
  if (!booking || booking.userId !== req.user._id)
    return res.status(404).json({ error: 'Booking not found.' });
  res.json({ status: 'success', data: { booking } });
});

router.patch('/bookings/:id/cancel', protect, (req, res) => {
  const booking = db.findById('bookings', req.params.id);
  if (!booking || booking.userId !== req.user._id)
    return res.status(404).json({ error: 'Booking not found.' });
  if (booking.bookingStatus === 'cancelled')
    return res.status(400).json({ error: 'Already cancelled.' });
  const updated = db.updateById('bookings', req.params.id, {
    bookingStatus: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelReason: req.body.reason || '',
  });
  res.json({ status: 'success', data: { booking: updated } });
});

module.exports = router;