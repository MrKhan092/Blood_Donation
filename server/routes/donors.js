const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  searchDonors,
  getCompatibleBloodTypes,
  getDonorById,
  updateAvailability,
  getMyDonations,
  getRelevantRequests,
  recordDonation
} = require('../controllers/donorController');

// @route   GET /api/donors/search
router.get('/search', protect, searchDonors);

// @route   GET /api/donors/compatible/:bloodType
router.get('/compatible/:bloodType', protect, getCompatibleBloodTypes);

// @route   GET /api/donors/my-donations
router.get('/my-donations', protect, authorize('donor'), getMyDonations);

// @route   GET /api/donors/relevant-requests
router.get('/relevant-requests', protect, authorize('donor'), getRelevantRequests);

// @route   GET /api/donors/:id
router.get('/:id', protect, getDonorById);

// @route   PUT /api/donors/availability
router.put('/availability', protect, authorize('donor'), updateAvailability);

// @route   PUT /api/donors/donation
router.put('/donation', protect, authorize('donor'), recordDonation);

module.exports = router;