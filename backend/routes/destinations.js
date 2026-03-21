const express = require('express');
const Destination = require('../models/Destination');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/destinations', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      const q = new RegExp(search, 'i');
      query.$or = [{ name: q }, { country: q }, { description: q }];
    }

    const destinations = await Destination.find(query);
    res.json({ status: 'success', total: destinations.length, data: { destinations } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch destinations.' });
  }
});

router.get('/destination/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest || !dest.isActive)
      return res.status(404).json({ error: 'Destination not found.' });
    res.json({ status: 'success', data: { destination: dest } });
  } catch (err) {
    res.status(404).json({ error: 'Destination not found.' });
  }
});

router.post('/destinations', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin only.' });
    const dest = await Destination.create({ ...req.body, isActive: true });
    res.status(201).json({ status: 'success', data: { destination: dest } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create destination.' });
  }
});

module.exports = router;