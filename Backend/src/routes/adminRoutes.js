const express = require('express');
const { getDashboard } = require('../controllers/adminController');
const { createTripPlan, getTripPlans, getTripPlanById, updateTripPlan, deleteTripPlan } = require('../controllers/tripController');
const { createDestination, getDestinations, getDestinationById, updateDestination, deleteDestination } = require('../controllers/destinationController');
const { createActivity, getActivities, getActivityById, updateActivity, deleteActivity } = require('../controllers/activityController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// All admin endpoints require a valid JWT and an admin role. This keeps the
// frontend-only user role from becoming an administrative account through body data.
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboard);

router.post('/trips', createTripPlan);
router.get('/trips', getTripPlans);
router.get('/trips/:id', getTripPlanById);
router.put('/trips/:id', updateTripPlan);
router.delete('/trips/:id', deleteTripPlan);

router.post('/destinations', createDestination);
router.get('/destinations', getDestinations);
router.get('/destinations/:id', getDestinationById);
router.put('/destinations/:id', updateDestination);
router.delete('/destinations/:id', deleteDestination);

router.post('/activities', createActivity);
router.get('/activities', getActivities);
router.get('/activities/:id', getActivityById);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

module.exports = router;
