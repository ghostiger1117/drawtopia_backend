// src/controllers/storyController.js
const supabase = require('../config/db');
const { validateStoryData, validateCharacterName, validateStoryTitle } = require('../utils/validation');

// POST /api/stories - Create new story
exports.createStory = async (req, res) => {
  const userId = req.user.id; // From auth middleware
  const { 
    child_profile_id, 
    character_name, 
    character_type, 
    special_ability,
    character_style,
    story_world,
    adventure_type 
  } = req.body;
  
  // Validation
  if (!character_name) {
    return res.status(400).json({ message: 'character_name is required' });
  }
  
  // Validate story data
  const validation = validateStoryData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: validation.errors 
    });
  }
  
  // Verify child profile belongs to user if provided
  if (child_profile_id) {
    const { data: childProfile, error: childError } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', child_profile_id)
      .eq('parent_id', userId)
      .single();
      
    if (childError || !childProfile) {
      return res.status(400).json({ message: 'Invalid child_profile_id or unauthorized access' });
    }
  }
  
  try {
    const storyData = {
      user_id: userId,
      child_profile_id: child_profile_id || null,
      character_name: character_name.trim(),
      character_type: character_type || null,
      special_ability: special_ability || null,
      character_style: character_style || null,
      story_world: story_world || null,
      adventure_type: adventure_type || null,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const { data, error } = await supabase
      .from('stories')
      .insert([storyData])
      .select('*')
      .single();
      
    if (error) {
      return res.status(500).json({ message: 'Failed to create story', error });
    }
    
    res.status(201).json({ message: 'Story created successfully', story: data });
    
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/stories/:id/upload - Upload character image
exports.uploadCharacterImage = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { image_url } = req.body;
  
  if (!image_url) {
    return res.status(400).json({ message: 'image_url is required' });
  }
  
  try {
    // Verify story belongs to user
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Update story with original image URL and set status to processing
    const { data, error } = await supabase
      .from('stories')
      .update({
        original_image_url: image_url,
        status: 'processing_character',
        updated_at: new Date()
      })
      .eq('id', storyId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    if (error) {
      return res.status(500).json({ message: 'Failed to upload character image', error });
    }
    
    res.json({ 
      message: 'Character image uploaded successfully. Processing started.', 
      story: data 
    });
    
  } catch (error) {
    console.error('Upload character image error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// PUT /api/stories/:id/character - Update character details
exports.updateCharacter = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { 
    character_name, 
    character_type, 
    special_ability, 
    character_style 
  } = req.body;
  
  // Build update object with only provided fields
  const updateData = {};
  
  if (character_name !== undefined) {
    if (!validateCharacterName(character_name)) {
      return res.status(400).json({ 
        message: 'Character name must be 1-100 characters and contain only letters, numbers, spaces, hyphens, and apostrophes' 
      });
    }
    updateData.character_name = character_name.trim();
  }
  
  if (character_type !== undefined) {
    const validation = validateStoryData({ character_type });
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    updateData.character_type = character_type;
  }
  
  if (special_ability !== undefined) {
    updateData.special_ability = special_ability;
  }
  
  if (character_style !== undefined) {
    const validation = validateStoryData({ character_style });
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    updateData.character_style = character_style;
  }
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  
  try {
    // Verify story belongs to user
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !existingStory) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    updateData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    if (error) {
      return res.status(500).json({ message: 'Failed to update character details', error });
    }
    
    res.json({ message: 'Character details updated successfully', story: data });
    
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// PUT /api/stories/:id/config - Update story configuration
exports.updateStoryConfig = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { 
    story_world, 
    adventure_type, 
    story_title, 
    special_message, 
    cover_design 
  } = req.body;
  
  // Build update object with only provided fields
  const updateData = {};
  
  if (story_world !== undefined) {
    const validation = validateStoryData({ story_world });
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    updateData.story_world = story_world;
  }
  
  if (adventure_type !== undefined) {
    const validation = validateStoryData({ adventure_type });
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    updateData.adventure_type = adventure_type;
  }
  
  if (story_title !== undefined) {
    if (story_title && !validateStoryTitle(story_title)) {
      return res.status(400).json({ 
        message: 'Story title must be 1-200 characters and contain only letters, numbers, spaces, and common punctuation' 
      });
    }
    updateData.story_title = story_title ? story_title.trim() : null;
  }
  
  if (special_message !== undefined) {
    updateData.special_message = special_message;
  }
  
  if (cover_design !== undefined) {
    updateData.cover_design = cover_design;
  }
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  
  try {
    // Verify story belongs to user
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !existingStory) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    updateData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    if (error) {
      return res.status(500).json({ message: 'Failed to update story configuration', error });
    }
    
    res.json({ message: 'Story configuration updated successfully', story: data });
    
  } catch (error) {
    console.error('Update story config error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/stories/:id/generate - Trigger story generation
exports.generateStory = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  
  try {
    // Verify story belongs to user and check current status
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Check if story has required fields for generation
    if (!story.character_name || !story.character_type || !story.story_world || !story.adventure_type) {
      return res.status(400).json({ 
        message: 'Story is missing required fields. Please complete character_name, character_type, story_world, and adventure_type first.' 
      });
    }
    
    // Check if story is in a valid state for generation
    if (story.status === 'generating_story' || story.status === 'generating_scenes') {
      return res.status(409).json({ 
        message: 'Story generation is already in progress' 
      });
    }
    
    if (story.status === 'completed') {
      return res.status(409).json({ 
        message: 'Story has already been generated' 
      });
    }
    
    // Update status to indicate generation has started
    const { data, error } = await supabase
      .from('stories')
      .update({
        status: story.original_image_url ? 'extracting_features' : 'generating_scenes',
        updated_at: new Date()
      })
      .eq('id', storyId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    if (error) {
      return res.status(500).json({ message: 'Failed to start story generation', error });
    }
    
    // TODO: Integrate with AI service for actual story generation
    // This would typically trigger background jobs for:
    // 1. Character feature extraction (if image provided)
    // 2. Scene generation
    // 3. Story content generation
    // 4. PDF and audio generation
    
    res.json({ 
      message: 'Story generation started successfully. This may take several minutes.', 
      story: data 
    });
    
  } catch (error) {
    console.error('Generate story error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Helper function to check if user has premium access
const hasFullAccess = (user) => {
  // Check subscription status - only free users have limited access
  return user.subscription_status === 'individual' || 
         user.subscription_status === 'family';
};

// GET /api/stories/:id/preview - Get story preview data
exports.getStoryPreview = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  
  try {
    // Verify story belongs to user
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Check if story is ready for preview
    if (story.status !== 'completed') {
      return res.status(400).json({ 
        message: `Story is not ready for preview. Current status: ${story.status}` 
      });
    }
    
    const userHasFullAccess = hasFullAccess(req.user);
    
    // Filter content based on user's subscription
    let filteredStoryContent = null;
    let filteredSceneImages = null;
    
    if (story.story_content) {
      const storyContent = story.story_content;
      const pages = storyContent.pages || [];
      
      // Free users get pages 1-2, premium users get all pages
      const accessiblePages = userHasFullAccess 
        ? pages 
        : pages.filter(page => page.page_number <= 2);
      
      filteredStoryContent = {
        ...storyContent,
        pages: accessiblePages,
        has_premium_content: pages.some(page => page.is_premium),
        user_access_level: userHasFullAccess ? 'full' : 'free'
      };
    }
    
    if (story.scene_images) {
      const sceneImages = story.scene_images;
      const scenes = sceneImages.scenes || [];
      
      // Free users get scenes for pages 1-2, premium users get all scenes
      const accessibleScenes = userHasFullAccess 
        ? scenes 
        : scenes.filter(scene => scene.page_number <= 2);
      
      filteredSceneImages = {
        ...sceneImages,
        scenes: accessibleScenes,
        cover_image_url: sceneImages.cover_image_url // Cover is always accessible
      };
    }
    
    // Prepare response with appropriate content
    const storyPreview = {
      id: story.id,
      character_name: story.character_name,
      character_type: story.character_type,
      character_style: story.character_style,
      story_world: story.story_world,
      adventure_type: story.adventure_type,
      story_title: story.story_title,
      special_message: story.special_message,
      consistency_score: story.consistency_score,
      story_content: filteredStoryContent,
      scene_images: filteredSceneImages,
      user_access_level: userHasFullAccess ? 'full' : 'free',
      created_at: story.created_at,
      updated_at: story.updated_at
    };
    
    res.json({ 
      message: 'Story preview retrieved successfully', 
      story: storyPreview 
    });
    
  } catch (error) {
    console.error('Get story preview error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// GET /api/stories/:id/pdf - Download complete PDF (PAID content)
exports.downloadPDF = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  
  try {
    // Verify story belongs to user
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Check if story is completed
    if (story.status !== 'completed') {
      return res.status(400).json({ 
        message: `PDF not available. Story status: ${story.status}` 
      });
    }
    
    // Check if PDF exists
    if (!story.pdf_url) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // Check if user has premium access for full PDF
    const userHasFullAccess = hasFullAccess(req.user);
    
    if (!userHasFullAccess) {
      return res.status(403).json({ 
        message: 'Premium subscription required to download complete PDF. Please upgrade your subscription.',
        upgrade_required: true
      });
    }
    
    // Return PDF download URL (in a real implementation, this might be a signed URL)
    res.json({ 
      message: 'PDF download ready', 
      pdf_url: story.pdf_url,
      download_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// GET /api/stories/:id/audio - Stream audio file
exports.getAudio = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { segment } = req.query; // 'preview' for pages 1-2, 'full' for complete audio
  
  try {
    // Verify story belongs to user
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Check if story is completed
    if (story.status !== 'completed') {
      return res.status(400).json({ 
        message: `Audio not available. Story status: ${story.status}` 
      });
    }
    
    // Check if audio exists
    if (!story.audio_url) {
      return res.status(404).json({ message: 'Audio not found' });
    }
    
    const userHasFullAccess = hasFullAccess(req.user);
    const requestingFullAudio = segment === 'full';
    
    // Check access permissions
    if (requestingFullAudio && !userHasFullAccess) {
      return res.status(403).json({ 
        message: 'Premium subscription required for complete audio. Free users can access preview (pages 1-2).',
        upgrade_required: true,
        preview_available: true
      });
    }
    
    // Determine which audio URL to return
    // In a real implementation, you might have separate audio files or use streaming with timestamps
    const audioResponse = {
      audio_url: story.audio_url,
      segment: requestingFullAudio && userHasFullAccess ? 'full' : 'preview',
      duration_seconds: requestingFullAudio && userHasFullAccess ? null : 120, // 2 minutes for preview
      user_access_level: userHasFullAccess ? 'full' : 'free'
    };
    
    res.json({ 
      message: 'Audio stream ready', 
      audio: audioResponse 
    });
    
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/stories/:id/unlock - Purchase full story access
exports.unlockStory = async (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { payment_method_id } = req.body;
  
  try {
    // Verify story belongs to user
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Check if user already has full access
    const userHasFullAccess = hasFullAccess(req.user);
    
    if (userHasFullAccess) {
      return res.status(400).json({ 
        message: 'You already have full access to this story with your current subscription.' 
      });
    }
    
    // Check if story is completed
    if (story.status !== 'completed') {
      return res.status(400).json({ 
        message: `Story must be completed before purchase. Current status: ${story.status}` 
      });
    }
    
    // TODO: Integrate with payment processor (Stripe)
    // This would typically:
    // 1. Process payment using payment_method_id
    // 2. Update user's subscription status
    // 3. Create transaction record
    // 4. Send confirmation email
    
    // For now, simulate successful payment processing
    // In real implementation, you would process the payment here
    
    // Update user's subscription (this is a simplified example)
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'individual',
        subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        updated_at: new Date()
      })
      .eq('id', userId)
      .select('*')
      .single();
      
    if (updateError) {
      console.error('Update subscription error:', updateError);
      return res.status(500).json({ message: 'Payment processed but subscription update failed' });
    }
    
    res.json({ 
      message: 'Story unlocked successfully! You now have full access.',
      subscription_status: 'individual',
      subscription_expires: updatedUser.subscription_expires,
      story_access: 'full'
    });
    
  } catch (error) {
    console.error('Unlock story error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};