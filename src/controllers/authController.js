// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const crypto = require('crypto');

// POST /api/auth/google
exports.googleAuth = async (req, res) => {
  // TODO: Implement Google OAuth callback logic
  res.status(501).json({ message: 'Not implemented' });
};

// POST /api/auth/otp/send
exports.sendOtp = async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ message: 'Email or phone is required' });
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in user_otps table (create this table in Supabase)
  const { error } = await supabase.from('user_otps').insert([
    { email, phone, otp, expires_at: expiresAt }
  ]);
  if (error) return res.status(500).json({ message: 'Failed to store OTP', error });

  // In production, send OTP via email/SMS provider
  res.json({ message: 'OTP sent', otp }); // For demo, return OTP in response
};

// POST /api/auth/otp/verify
exports.verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  if ((!email && !phone) || !otp) return res.status(400).json({ message: 'Email/phone and OTP are required' });
  const { data, error } = await supabase
    .from('user_otps')
    .select('*')
    .eq(email ? 'email' : 'phone', email || phone)
    .eq('otp', otp)
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return res.status(400).json({ message: 'Invalid OTP' });
  if (new Date(data.expires_at) < new Date()) return res.status(400).json({ message: 'OTP expired' });

  // Optionally, delete OTP after verification
  await supabase.from('user_otps').delete().eq('id', data.id);

  // Find or create user
  let user;
  if (email) {
    const { data: foundUser } = await supabase.from('users').select('*').eq('email', email).single();
    user = foundUser;
    if (!user) {
      const { data: newUser } = await supabase.from('users').insert([{ email }]).select('*').single();
      user = newUser;
    }
  } else if (phone) {
    const { data: foundUser } = await supabase.from('users').select('*').eq('phone', phone).single();
    user = foundUser;
    if (!user) {
      const { data: newUser } = await supabase.from('users').insert([{ phone }]).select('*').single();
      user = newUser;
    }
  }
  if (!user) return res.status(500).json({ message: 'User creation failed' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email } = req.body;
  // For demo: authenticate by email only. In production, add password or OTP verification.
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error || !user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  // Stateless JWT: client should delete token. Optionally, implement token blacklist.
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  // req.user is set by auth middleware
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { id } = req.user;
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
}; 