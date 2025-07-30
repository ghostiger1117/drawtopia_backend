// src/models/user.js
// This is a reference schema for the users table in Supabase/PostgreSQL

const UserSchema = {
  id: 'uuid', // PRIMARY KEY
  email: 'string', // UNIQUE, NOT NULL
  google_id: 'string', // UNIQUE, nullable
  phone: 'string', // nullable
  role: ['adult', 'child'], // enum
  created_at: 'timestamp',
  updated_at: 'timestamp',
  stripe_customer_id: 'string', // nullable
  subscription_status: ['free', 'individual', 'family'], // enum
  subscription_expires: 'timestamp', // nullable
  parent_consent_verified: 'boolean', // DEFAULT false
};

module.exports = UserSchema; 