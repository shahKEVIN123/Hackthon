const Trip = require('../models/Trip');

// Normalizes a destination string before validation so empty values and extra
// whitespace are rejected consistently on the server.
const normalizeDestination = (value) => {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
};

// Converts a date-like payload into a valid Date object and rejects invalid or
// malformed values before the database layer is reached.
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

// Accepts either numbers or numeric strings for the traveler count, while
// ensuring the final value is a positive integer.
const parseTravelers = (value) => {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	const parsedValue = Number(value);
	if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
		return null;
	}

	return parsedValue;
};

// Creates a trip for the authenticated user only. The frontend may send a user
// field, but the server always uses req.userId from the JWT so ownership cannot
// be spoofed.
const createTrip = async (req, res) => {
	const { destination, startDate, endDate, travelers } = req.body || {};

	if (!req.userId) {
		return res.status(401).json({ success: false, message: 'Authentication required to create a trip' });
	}

	const normalizedDestination = normalizeDestination(destination);
	const parsedStartDate = parseDate(startDate);
	const parsedEndDate = parseDate(endDate);
	const parsedTravelers = parseTravelers(travelers);

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
// dashboard can render the most recent trip first without leaking other users' data.
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

module.exports = { createTrip, getMyTrips, getTripById };
