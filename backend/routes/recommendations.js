const express = require('express');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const RELATED = {
  beach: ['beach', 'luxury'],
  mountain: ['mountain', 'adventure'],
  city: ['city', 'cultural'],
  cultural: ['cultural', 'city'],
  adventure: ['adventure', 'mountain'],
  luxury: ['luxury', 'beach'],
};

router.get('/recommendations/:destinationId', async (req, res) => {
  try {
    const source = await Destination.findById(req.params.destinationId);
    if (!source) return res.status(404).json({ error: 'Destination not found.' });

    const cats = RELATED[source.category] || [source.category];
    const recs = await Destination.find({
      isActive: true,
      _id: { $ne: source._id },
      category: { $in: cats },
    }).sort({ rating: -1 }).limit(6);

    res.json({ status: 'success', data: { recommendations: recs } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
});

router.get('/recommendations', protect, async (req, res) => {
  try {
    const [bookings, user] = await Promise.all([
      Booking.find({ userId: req.user._id }),
      User.findById(req.user._id),
    ]);

    const catCount = {};
    const bookedDestIds = bookings.map(b => b.destinationId.toString());

    const bookedDests = await Destination.find({ _id: { $in: bookedDestIds } });
    bookedDests.forEach(d => {
      if (d?.category) catCount[d.category] = (catCount[d.category] || 0) + 2;
    });

    const favDests = await Destination.find({ _id: { $in: user.favorites || [] } });
    favDests.forEach(d => {
      if (d?.category) catCount[d.category] = (catCount[d.category] || 0) + 1;
    });

    const topCats = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([c]) => c);

    const seenIds = [...bookedDestIds, ...(user.favorites || [])];
    const relCats = topCats.length
      ? [...new Set(topCats.flatMap(c => RELATED[c] || [c]))]
      : null;

    const query = {
      isActive: true,
      _id: { $nin: seenIds },
      ...(relCats && { category: { $in: relCats } }),
    };

    const recs = await Destination.find(query).sort({ rating: -1 }).limit(8);
    res.json({ status: 'success', data: { recommendations: recs } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
});

module.exports = router;