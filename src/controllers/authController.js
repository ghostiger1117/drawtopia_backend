// src/controllers/authController.js

const { supabaseAdmin, supabaseAuth } = require('../config/db');
const { validateUserData, validateEmail } = require('../utils/validation');

// POST /api/auth/google
exports.googleAuth = async (req, res) => {
  // TODO: Implement Google OAuth callback logic
  res.status(501).json({ message: 'Not implemented' });
};

// POST /api/auth/resend-verification
exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  try {
    // Resend verification email using Supabase Auth
    const { error } = await supabaseAuth.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim()
    });
    
    if (error) {
      return res.status(400).json({ 
        message: 'Failed to resend verification email', 
        error: error.message 
      });
    }
    
    res.json({ 
      message: 'Verification email sent successfully. Please check your email.' 
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/auth/otp/send
exports.sendOtp = async (req, res) => {
  const { email, phone } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }
  
  try {
    if (email) {
      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      // Send OTP to email using Supabase Auth
      const { data, error } = await supabaseAuth.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: true,
          data: {
            email_verified: false
          }
        }
      });
      
      if (error) {
        return res.status(400).json({ 
          message: 'Failed to send OTP', 
          error: error.message 
        });
      }
      
      res.json({ 
        message: 'OTP sent to email successfully',
        session: data.session ? 'Session created' : 'OTP sent'
      });
      
    } else if (phone) {
      // Validate phone format
      const { validatePhone } = require('../utils/validation');
      if (!validatePhone(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      
      // Send OTP to phone using Supabase Auth
      const { data, error } = await supabaseAuth.auth.signInWithOtp({
        phone: phone.trim(),
        options: {
          shouldCreateUser: true
        }
      });
      
      if (error) {
        return res.status(400).json({ 
          message: 'Failed to send OTP', 
          error: error.message 
        });
      }
      
      res.json({ 
        message: 'OTP sent to phone successfully',
        session: data.session ? 'Session created' : 'OTP sent'
      });
    }
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/auth/otp/verify
exports.verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  
  if ((!email && !phone) || !otp) {
    return res.status(400).json({ message: 'Email/phone and OTP are required' });
  }
  
  try {
    let verifyData;
    
    if (email) {
      // Verify OTP for email using Supabase Auth
      const { data, error } = await supabaseAuth.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: otp,
        type: 'email'
      });
      
      if (error) {
        return res.status(400).json({ 
          message: 'Invalid or expired OTP', 
          error: error.message 
        });
      }
      
      verifyData = data;
      
    } else if (phone) {
      // Verify OTP for phone using Supabase Auth
      const { data, error } = await supabaseAuth.auth.verifyOtp({
        phone: phone.trim(),
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        return res.status(400).json({ 
          message: 'Invalid or expired OTP', 
          error: error.message 
        });
      }
      
      verifyData = data;
    }
    
    if (!verifyData.user || !verifyData.session) {
      return res.status(400).json({ message: 'OTP verification failed' });
    }
    
    // Update or create user profile in custom users table
    const supabaseUser = verifyData.user;
    let userProfile;
    
    // Check if user profile exists in custom users table
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: supabaseUser.email,
          phone: supabaseUser.phone,
          updated_at: new Date()
        })
        .eq('id', supabaseUser.id)
        .select('*')
        .single();
        
      if (updateError) {
        console.error('Profile update error:', updateError);
      }
      
      userProfile = updatedProfile || existingProfile;
    } else {
      // Create new user profile
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: supabaseUser.id,
          email: supabaseUser.email,
          phone: supabaseUser.phone,
          role: 'adult',
          created_at: new Date(),
          updated_at: new Date()
        }])
        .select('*')
        .single();
        
      if (createError) {
        console.error('Profile creation error:', createError);
        // Continue with Supabase user data if profile creation fails
        userProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          phone: supabaseUser.phone,
          role: 'adult'
        };
      } else {
        userProfile = newProfile;
      }
    }
    
    res.json({
      message: 'OTP verified successfully',
      session: {
        access_token: verifyData.session.access_token,
        refresh_token: verifyData.session.refresh_token,
        expires_at: verifyData.session.expires_at,
        token_type: verifyData.session.token_type
      },
      user: {
        id: userProfile.id,
        email: userProfile.email,
        phone: userProfile.phone,
        role: userProfile.role,
        email_verified: supabaseUser.email_confirmed_at !== null,
        phone_verified: supabaseUser.phone_confirmed_at !== null
      }
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required for login. Use OTP endpoints for passwordless authentication.' });
  }
  
  try {
    // Sign in with email and password using Supabase Auth
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });
    
    if (error) {
      return res.status(401).json({ 
        message: 'Invalid credentials', 
        error: error.message 
      });
    }
    
    if (!data.user || !data.session) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    
    // Get user profile from custom users table
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    res.json({
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type
      },
      user: userProfile || {
        id: data.user.id,
        email: data.user.email,
        role: 'adult'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Set the session for supabaseAuth and sign out
      await supabaseAuth.auth.admin.signOut(token);
    }
    
    res.json({ message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, return success as the client should remove the token
    res.json({ message: 'Logged out successfully' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get the user from Supabase Auth using the token
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !authData.user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Get user profile from custom users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    const user = userProfile || {
      id: authData.user.id,
      email: authData.user.email,
      phone: authData.user.phone,
      role: 'adult'
    };
    
    res.json({
      user: {
        ...user,
        email_verified: authData.user.email_confirmed_at !== null,
        phone_verified: authData.user.phone_confirmed_at !== null
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// POST /api/auth/register
exports.register = async (req, res) => {
  const { email, password, first_name, last_name, phone, role } = req.body;
  
  // Basic required field validation
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  if (!first_name) {
    return res.status(400).json({ message: 'First name is required' });
  }
  
  // Comprehensive validation using utility functions
  const validation = validateUserData({ email, first_name, last_name, phone, role });
  if (!validation.isValid) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: validation.errors 
    });
  }
  
  try {
    // Sign up user with Supabase Auth
    const { data, error } = await supabaseAuth.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          first_name: first_name.trim(),
          last_name: last_name ? last_name.trim() : null,
          phone: phone ? phone.trim() : null
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ 
        message: 'Registration failed', 
        error: error.message 
      });
    }
    
    if (!data.user) {
      return res.status(400).json({ message: 'User registration failed' });
    }
    
    // Create user profile in custom users table
    const userData = {
      id: data.user.id,
      email: email.toLowerCase().trim(),
      first_name: first_name.trim(),
      last_name: last_name ? last_name.trim() : null,
      phone: phone ? phone.trim() : null,
      role: role || 'adult',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select('*')
      .single();
      
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue with registration even if profile creation fails
    }
    
    res.status(201).json({
      message: data.session 
        ? 'User registered and logged in successfully' 
        : 'User registered successfully. Please check your email to verify your account.',
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type
      } : null,
      user: userProfile || {
        id: data.user.id,
        email: data.user.email,
        first_name: first_name.trim(),
        last_name: last_name ? last_name.trim() : null,
        phone: phone ? phone.trim() : null,
        role: role || 'adult'
      },
      email_verified: data.user.email_confirmed_at !== null
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}; 