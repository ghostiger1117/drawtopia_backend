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

module.exports = {
  validateEmail,
  validatePhone,
  validateRole,
  validateAgeGroup,
  validateRelationship,
  validateName,
  validateUserData
}; 