// src/models/user.js
// This is a reference schema for the users table in Supabase/PostgreSQL

const UserSchema = {
  id: 'uuid', // PRIMARY KEY DEFAULT gen_random_uuid()
  email: 'string', // UNIQUE, NOT NULL
  google_id: 'string', // UNIQUE, nullable
  phone: 'string', // nullable
  first_name: 'string', // nullable
  last_name: 'string', // nullable
  role: ['adult', 'child'], // enum DEFAULT 'adult'
  created_at: 'timestamp', // DEFAULT NOW()
  updated_at: 'timestamp', // DEFAULT NOW()
  stripe_customer_id: 'string', // nullable
  subscription_status: ['free', 'individual', 'family'], // enum DEFAULT 'free'
  subscription_expires: 'timestamp', // nullable
  parent_consent_verified: 'boolean', // DEFAULT false
};

module.exports = UserSchema; 