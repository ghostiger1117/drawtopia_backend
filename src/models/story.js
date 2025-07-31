// src/models/story.js
// This is a reference schema for the stories table in Supabase/PostgreSQL

const StorySchema = {
  id: 'uuid', // PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: 'uuid', // REFERENCES users(id), NOT NULL
  child_profile_id: 'uuid', // REFERENCES child_profiles(id), nullable
  character_name: 'string', // NOT NULL
  character_type: ['person', 'animal', 'magical_creature'], // enum
  special_ability: 'text', // nullable
  character_style: ['3d', 'cartoon', 'anime'], // enum
  story_world: ['forest', 'space', 'underwater'], // enum
  adventure_type: ['treasure_hunt', 'helping_friend'], // enum
  original_image_url: 'string', // nullable
  enhanced_images: 'jsonb', // Array of S3 URLs for minimal/normal/high enhancement levels
  character_features: 'jsonb', // CLIP/IPAdapter extracted features for consistency
  story_content: 'jsonb', // Full 5-page story structure
  scene_images: 'jsonb', // Array of generated scene images with consistency scores
  story_title: 'string', // nullable
  special_message: 'text', // nullable
  cover_design: 'string', // nullable
  pdf_url: 'string', // nullable
  audio_url: 'string', // nullable
  consistency_score: 'decimal', // Average character consistency across scenes
  status: [
    'draft', 
    'processing_character', 
    'extracting_features', 
    'generating_scenes', 
    'generating_story', 
    'completed', 
    'failed'
  ], // enum DEFAULT 'draft'
  created_at: 'timestamp', // DEFAULT NOW()
  updated_at: 'timestamp', // DEFAULT NOW()
};

// Expected JSON structure for enhanced_images
const EnhancedImagesStructure = {
  minimal: 'string', // S3 URL
  normal: 'string',  // S3 URL
  high: 'string'     // S3 URL
};

// Expected JSON structure for character_features
const CharacterFeaturesStructure = {
  clip_features: 'array', // CLIP embedding vector
  ip_adapter_features: 'object', // IPAdapter extracted features
  consistency_tokens: 'array' // Tokens for maintaining character consistency
};

// Expected JSON structure for story_content
const StoryContentStructure = {
  pages: [
    {
      page_number: 'number',
      title: 'string',
      content: 'string',
      scene_description: 'string',
      is_premium: 'boolean' // true for pages 3-5, false for pages 1-2
    }
  ],
  total_pages: 'number',
  estimated_reading_time: 'number' // in minutes
};

// Expected JSON structure for scene_images
const SceneImagesStructure = {
  scenes: [
    {
      page_number: 'number',
      image_url: 'string', // S3 URL
      consistency_score: 'number', // 0-1 score
      generation_params: 'object',
      is_premium: 'boolean'
    }
  ],
  cover_image_url: 'string' // S3 URL for cover
};

module.exports = {
  StorySchema,
  EnhancedImagesStructure,
  CharacterFeaturesStructure,
  StoryContentStructure,
  SceneImagesStructure
};