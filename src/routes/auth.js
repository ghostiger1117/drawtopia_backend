const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

router.post('/google', authController.googleAuth);
router.post('/otp/send', authController.sendOtp);
router.post('/otp/verify', authController.verifyOtp);
router.post('/logout', authController.logout);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router; 