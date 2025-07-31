const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middlewares/auth');

// All story routes require authentication
router.use(authMiddleware);

// POST /api/stories - Create new story
router.post('/', storyController.createStory);

// POST /api/stories/:id/upload - Upload character image
router.post('/:id/upload', storyController.uploadCharacterImage);

// PUT /api/stories/:id/character - Update character details
router.put('/:id/character', storyController.updateCharacter);

// PUT /api/stories/:id/config - Update story configuration
router.put('/:id/config', storyController.updateStoryConfig);

// POST /api/stories/:id/generate - Trigger story generation
router.post('/:id/generate', storyController.generateStory);

// GET /api/stories/:id/preview - Get story preview data (FREE: pages 1-2, PAID: pages 3-5)
router.get('/:id/preview', storyController.getStoryPreview);

// GET /api/stories/:id/pdf - Download complete PDF (PAID content)
router.get('/:id/pdf', storyController.downloadPDF);

// GET /api/stories/:id/audio - Stream audio file (FREE: pages 1-2, PAID: complete)
router.get('/:id/audio', storyController.getAudio);

// POST /api/stories/:id/unlock - Purchase full story access
router.post('/:id/unlock', storyController.unlockStory);

module.exports = router;