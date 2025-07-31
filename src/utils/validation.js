// src/utils/validation.js

// Email validation using regex
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation - supports international formats
const validatePhone = (phone) => {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's between 10-15 digits (international standard)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return false;
  }
  
  // More comprehensive regex for international phone numbers
  const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s\-\.]?[\d]{1,4}[\s\-\.]?[\d]{1,4}[\s\-\.]?[\d]{1,9}$/;
  return phoneRegex.test(phone);
};

// Role validation
const validateRole = (role) => {
  const validRoles = ['adult', 'child'];
  return validRoles.includes(role);
};

// Age group validation for child profiles
const validateAgeGroup = (ageGroup) => {
  const validAgeGroups = ['0-2', '3-6', '5-7', '8-10', '11-12'];
  return validAgeGroups.includes(ageGroup);
};

// Relationship validation for child profiles
const validateRelationship = (relationship) => {
  const validRelationships = [
    'parent', 'aunt_uncle', 'grandparent', 'sibling', 
    'cousin', 'family_friend', 'guardian', 'teacher_mentor'
  ];
  return validRelationships.includes(relationship);
};

// Name validation (first_name, last_name)
const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Allow letters, spaces, hyphens, apostrophes (for names like O'Connor, Jean-Pierre)
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

// Comprehensive validation function
const validateUserData = (userData) => {
  const errors = [];
  
  if (userData.email && !validateEmail(userData.email)) {
    errors.push('Invalid email format');
  }
  
  if (userData.phone && !validatePhone(userData.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (userData.role && !validateRole(userData.role)) {
    errors.push('Role must be either "adult" or "child"');
  }
  
  if (userData.first_name && !validateName(userData.first_name)) {
    errors.push('First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');
  }
  
  if (userData.last_name && !validateName(userData.last_name)) {
    errors.push('Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Story-specific validation functions
const validateCharacterType = (characterType) => {
  const validTypes = ['person', 'animal', 'magical_creature'];
  return validTypes.includes(characterType);
};

const validateCharacterStyle = (characterStyle) => {
  const validStyles = ['3d', 'cartoon', 'anime'];
  return validStyles.includes(characterStyle);
};

const validateStoryWorld = (storyWorld) => {
  const validWorlds = ['forest', 'space', 'underwater'];
  return validWorlds.includes(storyWorld);
};

const validateAdventureType = (adventureType) => {
  const validTypes = ['treasure_hunt', 'helping_friend'];
  return validTypes.includes(adventureType);
};

const validateStoryStatus = (status) => {
  const validStatuses = [
    'draft', 'processing_character', 'extracting_features', 
    'generating_scenes', 'generating_story', 'completed', 'failed'
  ];
  return validStatuses.includes(status);
};

const validateCharacterName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Allow letters, spaces, hyphens, apostrophes, numbers (for character names like "Bot-3000")
  const nameRegex = /^[a-zA-Z0-9\s\-']{1,100}$/;
  return nameRegex.test(name.trim());
};

const validateStoryTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  
  // Allow letters, spaces, numbers, common punctuation
  const titleRegex = /^[a-zA-Z0-9\s\-'",.:!?]{1,200}$/;
  return titleRegex.test(title.trim());
};

// Comprehensive story validation function
const validateStoryData = (storyData) => {
  const errors = [];
  
  if (storyData.character_name && !validateCharacterName(storyData.character_name)) {
    errors.push('Character name must be 1-100 characters and contain only letters, numbers, spaces, hyphens, and apostrophes');
  }
  
  if (storyData.character_type && !validateCharacterType(storyData.character_type)) {
    errors.push('Character type must be one of: person, animal, magical_creature');
  }
  
  if (storyData.character_style && !validateCharacterStyle(storyData.character_style)) {
    errors.push('Character style must be one of: 3d, cartoon, anime');
  }
  
  if (storyData.story_world && !validateStoryWorld(storyData.story_world)) {
    errors.push('Story world must be one of: forest, space, underwater');
  }
  
  if (storyData.adventure_type && !validateAdventureType(storyData.adventure_type)) {
    errors.push('Adventure type must be one of: treasure_hunt, helping_friend');
  }
  
  if (storyData.story_title && !validateStoryTitle(storyData.story_title)) {
    errors.push('Story title must be 1-200 characters and contain only letters, numbers, spaces, and common punctuation');
  }
  
  if (storyData.status && !validateStoryStatus(storyData.status)) {
    errors.push('Status must be one of: draft, processing_character, extracting_features, generating_scenes, generating_story, completed, failed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRole,
  validateAgeGroup,
  validateRelationship,
  validateName,
  validateUserData,
  validateCharacterType,
  validateCharacterStyle,
  validateStoryWorld,
  validateAdventureType,
  validateStoryStatus,
  validateCharacterName,
  validateStoryTitle,
  validateStoryData
}; 