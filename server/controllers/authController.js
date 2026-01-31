const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body); // Debug log

    const {
      name,
      email,
      password,
      phone,
      role,
      address,
      city,
      state,
      pincode,
      bloodType,
      hospitalName,
      registrationNumber
    } = req.body;

    // Manual validation
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone, role'
      });
    }

    if (!address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete location details'
      });
    }

    // Role-specific validation
    if (role === 'donor' && !bloodType) {
      return res.status(400).json({
        success: false,
        message: 'Blood type is required for donors'
      });
    }

    if (role === 'hospital' && (!hospitalName || !registrationNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name and registration number are required for hospitals'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      location: {
        address,
        city,
        state,
        pincode
      }
    };

    // Add role-specific fields
    if (role === 'donor') {
      userData.bloodType = bloodType;
      userData.available = true;
    } else if (role === 'hospital') {
      userData.hospitalName = hospitalName;
      userData.registrationNumber = registrationNumber;
    }

    console.log('Creating user with data:', userData); // Debug log

    // Create user
    const user = await User.create(userData);

    console.log('User created successfully:', user._id); // Debug log

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Return response (password is excluded by User schema)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bloodType: user.bloodType,
        hospitalName: user.hospitalName,
        location: user.location,
        available: user.available
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email }); // Debug log

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('Login successful for user:', user._id); // Debug log

    // Return response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bloodType: user.bloodType,
        hospitalName: user.hospitalName,
        location: user.location,
        available: user.available,
        lastDonationDate: user.lastDonationDate
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Google authentication not implemented yet'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bloodType: user.bloodType,
        hospitalName: user.hospitalName,
        location: user.location,
        available: user.available,
        lastDonationDate: user.lastDonationDate
      }
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};