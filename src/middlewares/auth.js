const { supabaseAuth, supabaseAdmin } = require('../config/db');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !authData.user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Get user profile from custom users table
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    // Set user data in request object
    req.user = {
      id: authData.user.id,
      email: authData.user.email,
      phone: authData.user.phone,
      role: userProfile?.role || 'adult',
      email_verified: authData.user.email_confirmed_at !== null,
      phone_verified: authData.user.phone_confirmed_at !== null,
      ...userProfile
    };
    
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}; 