const express = require('express');
const db = require('../db/jsonDb');
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

router.get('/recommendations/:destinationId', (req, res) => {
  const source = db.findById('destinations', req.params.destinationId);
  if (!source) return res.status(404).json({ error: 'Destination not found.' });
  const cats = RELATED[source.category] || [source.category];
  const recs = db.find('destinations', { isActive: true })
    .filter(d => d._id !== source._id && cats.includes(d.category))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
  res.json({ status: 'success', data: { recommendations: recs } });
});

router.get('/recommendations', protect, (req, res) => {
  const bookings = db.find('bookings', { userId: req.user._id });
  const user = db.findById('users', req.user._id);
  const catCount = {};
  bookings.forEach(b => {
    const dest = db.findById('destinations', b.destinationId);
    if (dest?.category) catCount[dest.category] = (catCount[dest.category] || 0) + 2;
  });
  (user.favorites || []).forEach(fid => {
    const dest = db.findById('destinations', fid);
    if (dest?.category) catCount[dest.category] = (catCount[dest.category] || 0) + 1;
  });
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
  const seenIds = [...bookings.map(b => b.destinationId), ...(user.favorites || [])];
  const relCats = topCats.length ? [...new Set(topCats.flatMap(c => RELATED[c] || [c]))] : null;
  let recs = db.find('destinations', { isActive: true })
    .filter(d => !seenIds.includes(d._id) && (!relCats || relCats.includes(d.category)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
  res.json({ status: 'success', data: { recommendations: recs } });
});

module.exports = router;