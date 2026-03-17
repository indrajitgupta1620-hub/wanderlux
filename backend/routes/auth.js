const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/jsonDb');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Please provide name, email and password.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const exists = db.findOne('users', { email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ error: 'Account already exists.' });
    const hashed = await bcrypt.hash(password, 12);
    const user = db.insert('users', { name, email: email.toLowerCase(), password: hashed, favorites: [], role: 'user', isActive: true });
    const { password: _, ...safe } = user;
    res.status(201).json({ status: 'success', token: signToken(user._id), data: { user: safe } });
  } catch (err) { res.status(500).json({ error: 'Registration failed.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Please provide email and password.' });
    const user = db.findOne('users', { email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    const { password: _, ...safe } = user;
    res.json({ status: 'success', token: signToken(user._id), data: { user: safe } });
  } catch (err) { res.status(500).json({ error: 'Login failed.' }); }
});

router.get('/me', protect, (req, res) => {
  const user = db.findById('users', req.user._id);
  const { password: _, ...safe } = user;
  res.json({ status: 'success', data: { user: safe } });
});

router.patch('/me', protect, (req, res) => {
  const { name, phone } = req.body;
  const updated = db.updateById('users', req.user._id, { name, phone });
  const { password: _, ...safe } = updated;
  res.json({ status: 'success', data: { user: safe } });
});

router.post('/me/favorites/:destId', protect, (req, res) => {
  const user = db.findById('users', req.user._id);
  const favs = user.favorites || [];
  const idx = favs.indexOf(req.params.destId);
  if (idx === -1) favs.push(req.params.destId); else favs.splice(idx, 1);
  db.updateById('users', user._id, { favorites: favs });
  res.json({ status: 'success', favorites: favs });
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'wanderlux_secret_2025', { expiresIn: '7d' });

module.exports = router;