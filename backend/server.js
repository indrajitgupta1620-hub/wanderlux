const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./db/mongoose');
const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const bookingRoutes = require('./routes/bookings');
const recommendRoutes = require('./routes/recommendations');
const { seedIfEmpty } = require('./data/seed');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api', authRoutes);
app.use('/api', destinationRoutes);
app.use('/api', bookingRoutes);
app.use('/api', recommendRoutes);

app.get('/', (req, res) =>
  res.json({ status: 'ok', service: 'Wanderlux API', database: 'MongoDB Atlas' })
);

app.use((req, res) =>
  res.status(404).json({ error: `Route ${req.originalUrl} not found` })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`🚀  Wanderlux API running on http://localhost:${PORT}`);
  });
});

module.exports = app;