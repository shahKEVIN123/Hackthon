const Trip = require('../models/Trip');
const Destination = require('../models/Destination');
const Activity = require('../models/Activity');

// Provides the small dashboard summary used by the admin panel without adding
// complex analytics or heavy aggregation logic.
const getDashboard = async (req, res) => {
	try {
		const [totalTripPlans, publishedTripPlans, totalDestinations, totalActivities] = await Promise.all([
			Trip.countDocuments(),
			Trip.countDocuments({ status: 'published' }),
			Destination.countDocuments(),
			Activity.countDocuments(),
		]);

		const recentTripPlans = await Trip.find().sort({ createdAt: -1 }).limit(5).lean();

		return res.status(200).json({
			success: true,
			data: {
				totalTripPlans,
				publishedTripPlans,
				totalDestinations,
				totalActivities,
				recentTripPlans,
			},
		});
	} catch (error) {
		console.error(`Admin dashboard failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to load admin dashboard' });
	}
};

module.exports = { getDashboard };
