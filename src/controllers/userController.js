// src/controllers/userController.js
const supabase = require('../config/db');
const { validateAgeGroup, validateRelationship, validateName } = require('../utils/validation');

// POST /api/users/consent
exports.recordConsent = async (req, res) => {
  const userId = req.user.id; // From auth middleware
  const { consented } = req.body;
  
  if (typeof consented !== 'boolean') {
    return res.status(400).json({ message: 'Consent value (true/false) is required' });
  }
  
  const { data, error } = await supabase
    .from('users')
    .update({ parent_consent_verified: consented, updated_at: new Date() })
    .eq('id', userId)
    .select('*')
    .single();
    
  if (error) {
    return res.status(500).json({ message: 'Failed to record consent', error });
  }
  
  res.json({ message: 'Consent recorded successfully', user: data });
};

// GET /api/users/children
exports.getChildren = async (req, res) => {
  const parentId = req.user.id; // From auth middleware
  
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false });
    
  if (error) {
    return res.status(500).json({ message: 'Failed to fetch child profiles', error });
  }
  
  res.json({ children: data });
};

// POST /api/users/children
exports.createChild = async (req, res) => {
  const parentId = req.user.id; // From auth middleware
  const { first_name, age_group, relationship } = req.body;
  
  // Validation
  if (!first_name || !age_group || !relationship) {
    return res.status(400).json({ 
      message: 'first_name, age_group, and relationship are required' 
    });
  }
  
  // Validate first_name format
  if (!validateName(first_name)) {
    return res.status(400).json({ 
      message: 'First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes' 
    });
  }
  
  // Validate age_group
  if (!validateAgeGroup(age_group)) {
    return res.status(400).json({ 
      message: 'Invalid age_group. Must be one of: 0-2, 3-6, 5-7, 8-10, 11-12' 
    });
  }
  
  // Validate relationship
  if (!validateRelationship(relationship)) {
    return res.status(400).json({ 
      message: 'Invalid relationship. Must be one of: parent, aunt_uncle, grandparent, sibling, cousin, family_friend, guardian, teacher_mentor' 
    });
  }
  
  const { data, error } = await supabase
    .from('child_profiles')
    .insert([{
      parent_id: parentId,
      first_name: first_name.trim(),
      age_group,
      relationship,
      created_at: new Date()
    }])
    .select('*')
    .single();
    
  if (error) {
    return res.status(500).json({ message: 'Failed to create child profile', error });
  }
  
  res.status(201).json({ message: 'Child profile created successfully', child: data });
};

// PUT /api/users/children/:id
exports.updateChild = async (req, res) => {
  const parentId = req.user.id; // From auth middleware
  const childId = req.params.id;
  const { first_name, age_group, relationship } = req.body;
  
  // Build update object with only provided fields
  const updateData = {};
  
  if (first_name) {
    if (!validateName(first_name)) {
      return res.status(400).json({ 
        message: 'First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes' 
      });
    }
    updateData.first_name = first_name.trim();
  }
  
  if (age_group) {
    if (!validateAgeGroup(age_group)) {
      return res.status(400).json({ 
        message: 'Invalid age_group. Must be one of: 0-2, 3-6, 5-7, 8-10, 11-12' 
      });
    }
    updateData.age_group = age_group;
  }
  
  if (relationship) {
    if (!validateRelationship(relationship)) {
      return res.status(400).json({ 
        message: 'Invalid relationship. Must be one of: parent, aunt_uncle, grandparent, sibling, cousin, family_friend, guardian, teacher_mentor' 
      });
    }
    updateData.relationship = relationship;
  }
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  
  // Check if child belongs to the current user
  const { data: existingChild, error: fetchError } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .eq('parent_id', parentId)
    .single();
    
  if (fetchError || !existingChild) {
    return res.status(404).json({ message: 'Child profile not found or unauthorized' });
  }
  
  const { data, error } = await supabase
    .from('child_profiles')
    .update(updateData)
    .eq('id', childId)
    .eq('parent_id', parentId)
    .select('*')
    .single();
    
  if (error) {
    return res.status(500).json({ message: 'Failed to update child profile', error });
  }
  
  res.json({ message: 'Child profile updated successfully', child: data });
}; 