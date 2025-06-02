// controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

// Helper to sign token
function makeToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: true,           // uncomment if using HTTPS
  sameSite: 'lax',
  maxAge: (() => {
    const expire = process.env.JWT_COOKIE_EXPIRES_DAYS || 7;
    return parseInt(expire, 10) * 24 * 60 * 60 * 1000;
  })(),
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;
    // 1. Validate
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['jobseeker', 'recruiter','admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // 2. Hash & save User
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: role.toLowerCase(),
    });

    // 3. Create profile
    if (user.role === 'jobseeker') {
      await JobSeekerProfile.create({ user: user._id });
    } else if(user.role === 'recruiter'){
      await RecruiterProfile.create({ user: user._id , company : '' });
    }

    // 4. Issue token in cookie
    const token = makeToken(user._id, user.role);
    res.cookie('token', token, cookieOptions);

    // 5. Respond
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    // 2. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(user);
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // 3. Issue token in cookie
    const token = makeToken(user._id, user.role);
    res.cookie('token', token, cookieOptions);

    // 4. Respond
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getAuthUser = async (req, res) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user from DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 4. Return user info
    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

  } catch (err) {
    console.error('getAuthUser error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
