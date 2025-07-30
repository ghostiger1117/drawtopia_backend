const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

router.post('/consent', authMiddleware, userController.recordConsent);
router.get('/children', authMiddleware, userController.getChildren);
router.post('/children', authMiddleware, userController.createChild);
router.put('/children/:id', authMiddleware, userController.updateChild);

module.exports = router; 