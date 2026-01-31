const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

// @desc    Create new blood request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const {
      bloodType,
      unitsNeeded,
      urgency,
      hospitalName,
      patientName,
      contactNumber,
      address,
      city,
      state,
      pincode,
      reason,
      notes
    } = req.body;

    // Validation
    if (!bloodType || !patientName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Blood type, patient name, and contact number are required'
      });
    }

    // Create request
    const bloodRequest = await BloodRequest.create({
      requestedBy: req.user.id,
      bloodType,
      unitsNeeded: unitsNeeded || 1,
      urgency: urgency || 'urgent',
      hospitalName,
      patientName,
      contactNumber,
      location: {
        address,
        city,
        state,
        pincode
      },
      reason,
      notes
    });

    // Populate requester info
    await bloodRequest.populate('requestedBy', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      request: bloodRequest
    });

  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blood request',
      error: error.message
    });
  }
};

// @desc    Get all active blood requests
// @route   GET /api/requests
// @access  Private
exports.getAllRequests = async (req, res) => {
  try {
    const { bloodType, city, urgency, status } = req.query;

    let query = {};

    // Filters
    if (bloodType) query.bloodType = bloodType;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;
    else query.status = 'active'; // Default to active requests

    const requests = await BloodRequest.find(query)
      .populate('requestedBy', 'name email phone role')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood requests',
      error: error.message
    });
  }
};

// @desc    Get user's own requests
// @route   GET /api/requests/my-requests
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.id })
      .populate('responses.donor', 'name phone bloodType location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get My Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your requests',
      error: error.message
    });
  }
};

// @desc    Get single blood request by ID
// @route   GET /api/requests/:id
// @access  Private
exports.getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone role')
      .populate('responses.donor', 'name phone bloodType location');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Get Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood request',
      error: error.message
    });
  }
};

// @desc    Update blood request status
// @route   PUT /api/requests/:id/status
// @access  Private (Request owner only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check ownership
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      request
    });

  } catch (error) {
    console.error('Update Request Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request status',
      error: error.message
    });
  }
};

// @desc    Delete blood request
// @route   DELETE /api/requests/:id
// @access  Private (Request owner only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check ownership
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blood request deleted successfully'
    });

  } catch (error) {
    console.error('Delete Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blood request',
      error: error.message
    });
  }
};