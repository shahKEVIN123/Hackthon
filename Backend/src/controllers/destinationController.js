const Destination = require('../models/Destination');

// Validates destination payloads before saving to MongoDB so admin requests do not
// silently accept incomplete or malformed location records.
const validateDestination = (payload) => {
	const errors = [];
	const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
	const country = typeof payload?.country === 'string' ? payload.country.trim() : '';
	const region = typeof payload?.region === 'string' ? payload.region.trim() : '';
	const description = typeof payload?.description === 'string' ? payload.description.trim() : '';
	const image = typeof payload?.image === 'string' ? payload.image.trim() : '';
	const status = payload?.status ?? 'active';

	if (!name) errors.push('Destination name is required');
	if (!country) errors.push('Country is required');
	if (!region) errors.push('Region is required');
	if (status && !['active', 'inactive'].includes(status)) errors.push('Status must be active or inactive');
	if (payload?.description !== undefined && payload?.description !== null && typeof payload.description !== 'string') errors.push('Description must be a string');
	if (payload?.image !== undefined && payload?.image !== null && typeof payload.image !== 'string') errors.push('Image must be a string');

	return { errors, values: { name, country, region, description, image, status } };
};

const createDestination = async (req, res) => {
	const { errors, values } = validateDestination(req.body || {});
	if (errors.length) {
		return res.status(400).json({ success: false, message: errors[0] });
	}

	try {
		const destination = await Destination.create({
			name: values.name,
			country: values.country,
			region: values.region,
			description: values.description,
			image: values.image,
			status: values.status,
		});

		return res.status(201).json({ success: true, message: 'Destination created successfully', data: { destination } });
	} catch (error) {
		console.error(`Destination creation failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to create destination' });
	}
};

const getDestinations = async (req, res) => {
	try {
		const destinations = await Destination.find().sort({ createdAt: -1 });
		return res.status(200).json({ success: true, data: { destinations } });
	} catch (error) {
		console.error(`Destination fetch failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch destinations' });
	}
};

const getDestinationById = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid destination ID' });
		}

		const destination = await Destination.findById(req.params.id);
		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		return res.status(200).json({ success: true, data: { destination } });
	} catch (error) {
		console.error(`Destination lookup failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch destination' });
	}
};

const updateDestination = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid destination ID' });
		}

		const destination = await Destination.findById(req.params.id);
		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		const payload = req.body || {};
		const { errors, values } = validateDestination({
			name: payload.name ?? destination.name,
			country: payload.country ?? destination.country,
			region: payload.region ?? destination.region,
			description: payload.description ?? destination.description,
			image: payload.image ?? destination.image,
			status: payload.status ?? destination.status,
		});

		if (errors.length) {
			return res.status(400).json({ success: false, message: errors[0] });
		}

		destination.name = values.name;
		destination.country = values.country;
		destination.region = values.region;
		destination.description = values.description;
		destination.image = values.image;
		destination.status = values.status;

		await destination.save();
		return res.status(200).json({ success: true, message: 'Destination updated successfully', data: { destination } });
	} catch (error) {
		console.error(`Destination update failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to update destination' });
	}
};

const deleteDestination = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid destination ID' });
		}

		const destination = await Destination.findByIdAndDelete(req.params.id);
		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		return res.status(200).json({ success: true, message: 'Destination deleted successfully' });
	} catch (error) {
		console.error(`Destination deletion failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to delete destination' });
	}
};

module.exports = { createDestination, getDestinations, getDestinationById, updateDestination, deleteDestination };
