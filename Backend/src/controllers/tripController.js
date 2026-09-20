const Trip = require('../models/Trip');

// Shared validation helpers keep the user trip flow and admin trip plan flow
// consistent while still enforcing the required security checks.
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const parseDate = (value) => {
	if (!value) {
		return null;
	}

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		return null;
	}

	return parsedDate;
};

const parsePositiveNumber = (value, minimum = 0) => {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue) || parsedValue < minimum) {
		return null;
	}

	return parsedValue;
};

const validateTripPlanPayload = (payload = {}) => {
	const errors = [];
	const destination = normalizeText(payload.destination);
	const description = typeof payload.description === 'string' ? payload.description.trim() : '';
	const startDate = parseDate(payload.startDate);
	const endDate = parseDate(payload.endDate);
	const duration = parsePositiveNumber(payload.duration, 1);
	const estimatedBudget = parsePositiveNumber(payload.estimatedBudget, 0);
	const travelers = parsePositiveNumber(payload.travelers, 1);
	const currency = normalizeText(payload.currency) || 'USD';
	const status = payload.status || 'draft';
	const featured = typeof payload.featured === 'boolean' ? payload.featured : false;

	if (!destination) errors.push('Destination is required');
	if (payload.description !== undefined && payload.description !== null && typeof payload.description !== 'string') errors.push('Description must be a string');
	if (!startDate) errors.push('Start date is required and must be valid');
	if (!endDate) errors.push('End date is required and must be valid');
	if (startDate && endDate && endDate < startDate) errors.push('End date must not be before start date');
	if (duration === null) errors.push('Duration must be a valid positive number');
	if (estimatedBudget === null) errors.push('Estimated budget must be a valid non-negative number');
	if (travelers === null) errors.push('Travelers must be a positive number');
	if (!['draft', 'published'].includes(status)) errors.push('Status must be draft or published');
	if (payload.featured !== undefined && payload.featured !== null && typeof payload.featured !== 'boolean') errors.push('Featured must be a boolean');
	if (!currency) errors.push('Currency is required');

	return {
		errors,
		values: {
			destination,
			description,
			startDate,
			endDate,
			duration,
			estimatedBudget,
			travelers,
			currency,
			status,
			featured,
		},
	};
};

// Creates a trip for the authenticated user only. The frontend may send a user
// field, but the server always uses req.userId from the JWT so ownership cannot
// be spoofed.
const createTrip = async (req, res) => {
	const { destination, startDate, endDate, travelers } = req.body || {};

	if (!req.userId) {
		return res.status(401).json({ success: false, message: 'Authentication required to create a trip' });
	}

	const normalizedDestination = normalizeText(destination);
	const parsedStartDate = parseDate(startDate);
	const parsedEndDate = parseDate(endDate);
	const parsedTravelers = parsePositiveNumber(travelers, 1);

	if (!normalizedDestination) {
		return res.status(400).json({ success: false, message: 'Destination is required' });
	}
	if (!parsedStartDate) {
		return res.status(400).json({ success: false, message: 'Start date must be a valid date' });
	}
	if (!parsedEndDate) {
		return res.status(400).json({ success: false, message: 'End date must be a valid date' });
	}
	if (parsedEndDate <= parsedStartDate) {
		return res.status(400).json({ success: false, message: 'End date must be after start date' });
	}
	if (parsedTravelers === null) {
		return res.status(400).json({ success: false, message: 'Travelers must be a positive integer' });
	}

	try {
		const trip = await Trip.create({
			user: req.userId,
			destination: normalizedDestination,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
			travelers: parsedTravelers,
			status: 'draft',
		});

		return res.status(201).json({
			success: true,
			message: 'Trip created successfully',
			data: { trip },
		});
	} catch (error) {
		console.error(`Trip creation failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to create trip' });
	}
};

// Returns only the current user's trips, ordered by newest first so the
// dashboard can render the most recent trip without leaking another user's data.
const getMyTrips = async (req, res) => {
	if (!req.userId) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	try {
		const trips = await Trip.find({ user: req.userId }).sort({ createdAt: -1 });
		return res.status(200).json({ success: true, data: { trips } });
	} catch (error) {
		console.error(`Trip fetch failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch trips' });
	}
};

// Fetches a single trip only if it belongs to the authenticated user. This keeps
// a user from discovering another account's private trip by guessing the ID.
const getTripById = async (req, res) => {
	if (!req.userId) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	try {
		const trip = await Trip.findOne({ _id: req.params.id, user: req.userId });

		if (!trip) {
			return res.status(404).json({ success: false, message: 'Trip not found' });
		}

		return res.status(200).json({ success: true, data: { trip } });
	} catch (error) {
		console.error(`Trip lookup failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch trip' });
	}
};

// Admin trip plan CRUD endpoints. These use the same Trip model but are meant for
// managing published trip plans rather than the individual user's draft trip flow.
const createTripPlan = async (req, res) => {
	if (!req.userId) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	const { errors, values } = validateTripPlanPayload(req.body || {});
	if (errors.length) {
		return res.status(400).json({ success: false, message: errors[0] });
	}

	try {
		const trip = await Trip.create({
			user: req.userId,
			destination: values.destination,
			description: values.description,
			coverImage: typeof req.body.coverImage === 'string' ? req.body.coverImage.trim() : '',
			startDate: values.startDate,
			endDate: values.endDate,
			duration: values.duration,
			estimatedBudget: values.estimatedBudget,
			currency: values.currency,
			travelers: values.travelers,
			status: values.status,
			featured: values.featured,
		});

		return res.status(201).json({ success: true, message: 'Trip plan created successfully', data: { trip } });
	} catch (error) {
		console.error(`Trip plan creation failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to create trip plan' });
	}
};

const getTripPlans = async (req, res) => {
	try {
		const trips = await Trip.find().sort({ createdAt: -1 });
		return res.status(200).json({ success: true, data: { trips } });
	} catch (error) {
		console.error(`Trip plan fetch failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch trip plans' });
	}
};

const getTripPlanById = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid trip plan ID' });
		}

		const trip = await Trip.findById(req.params.id);
		if (!trip) {
			return res.status(404).json({ success: false, message: 'Trip plan not found' });
		}

		return res.status(200).json({ success: true, data: { trip } });
	} catch (error) {
		console.error(`Trip plan lookup failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch trip plan' });
	}
};

const updateTripPlan = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid trip plan ID' });
		}

		const trip = await Trip.findById(req.params.id);
		if (!trip) {
			return res.status(404).json({ success: false, message: 'Trip plan not found' });
		}

		const { errors, values } = validateTripPlanPayload({
			destination: req.body.destination ?? trip.destination,
			description: req.body.description ?? trip.description,
			coverImage: req.body.coverImage ?? trip.coverImage,
			startDate: req.body.startDate ?? trip.startDate,
			endDate: req.body.endDate ?? trip.endDate,
			duration: req.body.duration ?? trip.duration,
			estimatedBudget: req.body.estimatedBudget ?? trip.estimatedBudget,
			currency: req.body.currency ?? trip.currency,
			travelers: req.body.travelers ?? trip.travelers,
			status: req.body.status ?? trip.status,
			featured: req.body.featured ?? trip.featured,
		});

		if (errors.length) {
			return res.status(400).json({ success: false, message: errors[0] });
		}

		trip.destination = values.destination;
		trip.description = values.description;
		trip.coverImage = typeof req.body.coverImage === 'string' ? req.body.coverImage.trim() : trip.coverImage;
		trip.startDate = values.startDate;
		trip.endDate = values.endDate;
		trip.duration = values.duration;
		trip.estimatedBudget = values.estimatedBudget;
		trip.currency = values.currency;
		trip.travelers = values.travelers;
		trip.status = values.status;
		trip.featured = values.featured;

		await trip.save();
		return res.status(200).json({ success: true, message: 'Trip plan updated successfully', data: { trip } });
	} catch (error) {
		console.error(`Trip plan update failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to update trip plan' });
	}
};

const deleteTripPlan = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid trip plan ID' });
		}

		const trip = await Trip.findByIdAndDelete(req.params.id);
		if (!trip) {
			return res.status(404).json({ success: false, message: 'Trip plan not found' });
		}

		return res.status(200).json({ success: true, message: 'Trip plan deleted successfully' });
	} catch (error) {
		console.error(`Trip plan deletion failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to delete trip plan' });
	}
};

module.exports = {
	createTrip,
	getMyTrips,
	getTripById,
	createTripPlan,
	getTripPlans,
	getTripPlanById,
	updateTripPlan,
	deleteTripPlan,
};
