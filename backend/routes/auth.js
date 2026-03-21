const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'wanderlux_secret_2025', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Please provide name, email and password.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ error: 'Account already exists.' });

    // NO manual bcrypt.hash here — User model handles it
    const user = await User.create({ name, email, password, favorites: [], role: 'user', isActive: true });
    const { password: _, ...safe } = user.toObject();
    res.status(201).json({ status: 'success', token: signToken(user._id), data: { user: safe } });
  } catch (err) {
    console.error('Register error:', err); // ← add this to see error in Render logs
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Please provide email and password.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.correctPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' });

    const { password: _, ...safe } = user.toObject();
    res.json({ status: 'success', token: signToken(user._id), data: { user: safe } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ status: 'success', data: { user: req.user } });
});

router.patch('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ status: 'success', data: { user: updated } });
  } catch (err) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

router.post('/me/favorites/:destId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favs = user.favorites || [];
    const idx = favs.indexOf(req.params.destId);
    if (idx === -1) favs.push(req.params.destId);
    else favs.splice(idx, 1);
    await User.findByIdAndUpdate(req.user._id, { favorites: favs });
    res.json({ status: 'success', favorites: favs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update favorites.' });
  }
});

module.exports = router;