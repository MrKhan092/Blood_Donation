const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// @desc    Get hospital's blood inventory/stats
// @route   GET /api/hospitals/dashboard
// @access  Private (Hospital only)
exports.getHospitalDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access this'
      });
    }

    // Get all requests created by this hospital
    const totalRequests = await BloodRequest.countDocuments({
      requestedBy: req.user.id
    });

    const activeRequests = await BloodRequest.countDocuments({
      requestedBy: req.user.id,
      status: 'active'
    });

    const fulfilledRequests = await BloodRequest.countDocuments({
      requestedBy: req.user.id,
      status: 'fulfilled'
    });

    const cancelledRequests = await BloodRequest.countDocuments({
      requestedBy: req.user.id,
      status: 'cancelled'
    });

    // Get donors in the hospital's city
    const localDonors = await User.countDocuments({
      role: 'donor',
      'location.city': req.user.location.city,
      isActive: true
    });

    const availableDonors = await User.countDocuments({
      role: 'donor',
      'location.city': req.user.location.city,
      available: true,
      isActive: true
    });

    // Blood type distribution
    const bloodTypeStats = await User.aggregate([
      {
        $match: {
          role: 'donor',
          'location.city': req.user.location.city,
          available: true,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const stats = {
      requests: {
        total: totalRequests,
        active: activeRequests,
        fulfilled: fulfilledRequests,
        cancelled: cancelledRequests
      },
      donors: {
        total: localDonors,
        available: availableDonors
      },
      bloodTypeDistribution: bloodTypeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get Hospital Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Bulk search donors by multiple blood types
// @route   POST /api/hospitals/bulk-search
// @access  Private (Hospital only)
exports.bulkSearchDonors = async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access this'
      });
    }

    const { bloodTypes, city, state, availableOnly } = req.body;

    let query = {
      role: 'donor',
      isActive: true
    };

    // Blood types filter (array)
    if (bloodTypes && bloodTypes.length > 0) {
      query.bloodType = { $in: bloodTypes };
    }

    // Availability filter
    if (availableOnly === true) {
      query.available = true;
    }

    // Location filters
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    } else {
      // Default to hospital's city if not specified
      query['location.city'] = new RegExp(req.user.location.city, 'i');
    }

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    const donors = await User.find(query)
      .select('name email phone bloodType location available lastDonationDate')
      .sort({ bloodType: 1, available: -1 })
      .limit(100);

    // Add canDonate status
    const donorsWithStatus = donors.map(donor => ({
      id: donor._id,
      name: donor.name,
      bloodType: donor.bloodType,
      location: donor.location,
      phone: donor.phone,
      email: donor.email,
      available: donor.available,
      canDonate: donor.canDonate(),
      lastDonationDate: donor.lastDonationDate
    }));

    res.status(200).json({
      success: true,
      count: donorsWithStatus.length,
      donors: donorsWithStatus
    });

  } catch (error) {
    console.error('Bulk Search Donors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching donors',
      error: error.message
    });
  }
};

// @desc    Get all requests created by hospital
// @route   GET /api/hospitals/my-requests
// @access  Private (Hospital only)
exports.getHospitalRequests = async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access this'
      });
    }

    const { status } = req.query;

    let query = { requestedBy: req.user.id };

    if (status) {
      query.status = status;
    }

    const requests = await BloodRequest.find(query)
      .populate('responses.donor', 'name phone bloodType')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get Hospital Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// @desc    Create bulk blood request
// @route   POST /api/hospitals/bulk-request
// @access  Private (Hospital only)
exports.createBulkRequest = async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can create bulk requests'
      });
    }

    const { requests } = req.body; // Array of request objects

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Requests array is required'
      });
    }

    // Validate and create multiple requests
    const createdRequests = [];

    for (const requestData of requests) {
      const bloodRequest = await BloodRequest.create({
        requestedBy: req.user.id,
        bloodType: requestData.bloodType,
        unitsNeeded: requestData.unitsNeeded || 1,
        urgency: requestData.urgency || 'urgent',
        hospitalName: req.user.hospitalName,
        patientName: requestData.patientName,
        contactNumber: requestData.contactNumber || req.user.phone,
        location: {
          address: req.user.location.address,
          city: req.user.location.city,
          state: req.user.location.state,
          pincode: req.user.location.pincode
        },
        reason: requestData.reason,
        notes: requestData.notes
      });

      createdRequests.push(bloodRequest);
    }

    res.status(201).json({
      success: true,
      message: `${createdRequests.length} blood requests created successfully`,
      count: createdRequests.length,
      requests: createdRequests
    });

  } catch (error) {
    console.error('Create Bulk Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bulk requests',
      error: error.message
    });
  }
};

// @desc    Get blood type statistics for hospital area
// @route   GET /api/hospitals/blood-stats
// @access  Private (Hospital only)
exports.getBloodTypeStats = async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access this'
      });
    }

    const city = req.query.city || req.user.location.city;

    // Get all donors by blood type
    const allDonorsStats = await User.aggregate([
      {
        $match: {
          role: 'donor',
          'location.city': new RegExp(city, 'i'),
          isActive: true
        }
      },
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: ['$available', 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get active requests by blood type
    const requestStats = await BloodRequest.aggregate([
      {
        $match: {
          status: 'active',
          'location.city': new RegExp(city, 'i')
        }
      },
      {
        $group: {
          _id: '$bloodType',
          totalRequests: { $sum: 1 },
          totalUnitsNeeded: { $sum: '$unitsNeeded' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      city,
      donorStats: allDonorsStats,
      requestStats
    });

  } catch (error) {
    console.error('Get Blood Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood type statistics',
      error: error.message
    });
  }
};