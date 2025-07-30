const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');

router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router; 