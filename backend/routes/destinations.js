const express = require('express');
const db = require('../db/jsonDb');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/destinations', (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let dests = db.find('destinations', { isActive: true });
    if (category && category !== 'all')
      dests = dests.filter(d => d.category === category);
    if (featured === 'true')
      dests = dests.filter(d => d.isFeatured);
    if (search) {
      const q = search.toLowerCase();
      dests = dests.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    }
    res.json({ status: 'success', total: dests.length, data: { destinations: dests } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch destinations.' }); }
});

router.get('/destination/:id', (req, res) => {
  const dest = db.findById('destinations', req.params.id);
  if (!dest || !dest.isActive)
    return res.status(404).json({ error: 'Destination not found.' });
  res.json({ status: 'success', data: { destination: dest } });
});

router.post('/destinations', protect, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin only.' });
  const dest = db.insert('destinations', { ...req.body, isActive: true });
  res.status(201).json({ status: 'success', data: { destination: dest } });
});

module.exports = router;