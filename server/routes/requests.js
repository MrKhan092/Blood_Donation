const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/requestController');

// @route   POST /api/requests
router.post('/', protect, createRequest);

// @route   GET /api/requests
router.get('/', protect, getAllRequests);

// @route   GET /api/requests/my-requests
router.get('/my-requests', protect, getMyRequests);

// @route   GET /api/requests/:id
router.get('/:id', protect, getRequestById);

// @route   PUT /api/requests/:id/status
router.put('/:id/status', protect, updateRequestStatus);

// @route   DELETE /api/requests/:id
router.delete('/:id', protect, deleteRequest);

module.exports = router;