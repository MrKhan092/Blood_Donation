const User = require('../models/User');

// @desc    Search donors by blood type and location
// @route   GET /api/donors/search
// @access  Private
exports.searchDonors = async (req, res) => {
  try {
    const { bloodType, city, state, pincode } = req.query;

    // Build query
    let query = {
      role: 'donor',
      available: true,
      isActive: true
    };

    // Blood type filter
    if (bloodType) {
      query.bloodType = bloodType;
    }

    // Location filters
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }
    if (pincode) {
      query['location.pincode'] = pincode;
    }

    // Find donors
    const donors = await User.find(query)
      .select('name email phone bloodType location available lastDonationDate')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate if donor can donate (90 days gap)
    const donorsWithStatus = donors.map(donor => {
      const canDonate = donor.canDonate();
      return {
        id: donor._id,
        name: donor.name,
        bloodType: donor.bloodType,
        location: donor.location,
        phone: donor.phone,
        email: donor.email,
        available: donor.available,
        canDonate: canDonate,
        lastDonationDate: donor.lastDonationDate
      };
    });

    res.status(200).json({
      success: true,
      count: donorsWithStatus.length,
      donors: donorsWithStatus
    });

  } catch (error) {
    console.error('Search Donors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching donors',
      error: error.message
    });
  }
};

// @desc    Get compatible blood types for a given blood type
// @route   GET /api/donors/compatible/:bloodType
// @access  Private
exports.getCompatibleBloodTypes = async (req, res) => {
  try {
    const { bloodType } = req.params;

    // Blood type compatibility chart
    const compatibility = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-'] // Universal donor
    };

    const compatibleTypes = compatibility[bloodType] || [bloodType];

    res.status(200).json({
      success: true,
      bloodType,
      compatibleTypes
    });

  } catch (error) {
    console.error('Get Compatible Blood Types Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching compatible blood types',
      error: error.message
    });
  }
};

// @desc    Get donor by ID
// @route   GET /api/donors/:id
// @access  Private
exports.getDonorById = async (req, res) => {
  try {
    const donor = await User.findById(req.params.id)
      .select('name email phone bloodType location available lastDonationDate createdAt');

    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.status(200).json({
      success: true,
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        bloodType: donor.bloodType,
        location: donor.location,
        available: donor.available,
        canDonate: donor.canDonate(),
        lastDonationDate: donor.lastDonationDate,
        memberSince: donor.createdAt
      }
    });

  } catch (error) {
    console.error('Get Donor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donor details',
      error: error.message
    });
  }
};

// @desc    Update donor availability
// @route   PUT /api/donors/availability
// @access  Private (Donor only)
exports.updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    if (req.user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can update availability'
      });
    }

    const donor = await User.findByIdAndUpdate(
      req.user.id,
      { available },
      { new: true, runValidators: true }
    ).select('name bloodType available');

    res.status(200).json({
      success: true,
      message: `Availability updated to ${available ? 'Available' : 'Not Available'}`,
      donor
    });

  } catch (error) {
    console.error('Update Availability Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message
    });
  }
};
// @desc    Get donor's donation history
// @route   GET /api/donors/my-donations
// @access  Private (Donor only)
exports.getMyDonations = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can access donation history'
      });
    }

    const donor = await User.findById(req.user.id)
      .select('name bloodType available lastDonationDate createdAt');

    // Calculate donation stats
    const stats = {
      totalDonations: 0, // TODO: Implement donation tracking
      lastDonationDate: donor.lastDonationDate,
      canDonate: donor.canDonate(),
      daysSinceLastDonation: donor.lastDonationDate 
        ? Math.floor((Date.now() - donor.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      nextEligibleDate: donor.lastDonationDate
        ? new Date(donor.lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000)
        : null
    };

    res.status(200).json({
      success: true,
      donor,
      stats
    });

  } catch (error) {
    console.error('Get My Donations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation history',
      error: error.message
    });
  }
};

// @desc    Get blood requests relevant to donor
// @route   GET /api/donors/relevant-requests
// @access  Private (Donor only)
exports.getRelevantRequests = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can access this'
      });
    }

    const donor = await User.findById(req.user.id);

    // Find requests matching donor's blood type
    const BloodRequest = require('../models/BloodRequest');
    const requests = await BloodRequest.find({
      bloodType: donor.bloodType,
      status: 'active',
      'location.city': donor.location.city
    })
      .populate('requestedBy', 'name phone')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get Relevant Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// @desc    Update last donation date
// @route   PUT /api/donors/donation
// @access  Private (Donor only)
exports.recordDonation = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can record donations'
      });
    }

    const { donationDate } = req.body;

    const donor = await User.findByIdAndUpdate(
      req.user.id,
      { 
        lastDonationDate: donationDate || new Date(),
        available: false // Automatically set to unavailable after donation
      },
      { new: true }
    ).select('name bloodType available lastDonationDate');

    res.status(200).json({
      success: true,
      message: 'Donation recorded successfully',
      donor
    });

  } catch (error) {
    console.error('Record Donation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording donation',
      error: error.message
    });
  }
};