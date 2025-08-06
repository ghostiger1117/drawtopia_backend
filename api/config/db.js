// src/config/db.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Admin client for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Auth client for user authentication operations
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = {
  supabaseAdmin,
  supabaseAuth,
  // Keep the default export for backward compatibility
  default: supabaseAdmin
}; 