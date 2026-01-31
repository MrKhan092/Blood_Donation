const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getHospitalDashboard,
  bulkSearchDonors,
  getHospitalRequests,
  createBulkRequest,
  getBloodTypeStats
} = require('../controllers/hospitalController');

// All routes require hospital role
router.use(protect);
router.use(authorize('hospital'));

// @route   GET /api/hospitals/dashboard
router.get('/dashboard', getHospitalDashboard);

// @route   POST /api/hospitals/bulk-search
router.post('/bulk-search', bulkSearchDonors);

// @route   GET /api/hospitals/my-requests
router.get('/my-requests', getHospitalRequests);

// @route   POST /api/hospitals/bulk-request
router.post('/bulk-request', createBulkRequest);

// @route   GET /api/hospitals/blood-stats
router.get('/blood-stats', getBloodTypeStats);

module.exports = router;