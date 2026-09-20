const express = require('express');
const { createTrip, getMyTrips, getTripById } = require('../controllers/tripController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Protects trip creation and trip retrieval routes with the existing JWT-based
// auth middleware so only the owner can create or read private trip records.
router.post('/', protect, createTrip);
router.get('/', protect, getMyTrips);
router.get('/:id', protect, getTripById);

module.exports = router;
