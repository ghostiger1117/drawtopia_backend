const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/consent', userController.recordConsent);
router.get('/children', userController.getChildren);
router.post('/children', userController.createChild);
router.put('/children/:id', userController.updateChild);

module.exports = router; 