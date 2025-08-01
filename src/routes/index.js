const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const storyRoutes = require('./stories');

router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stories', storyRoutes);

module.exports = router; 