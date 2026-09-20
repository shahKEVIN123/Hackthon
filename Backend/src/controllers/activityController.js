const Activity = require('../models/Activity');

// Validates admin activity payloads before storing them and keeps the data model
// aligned with the destination reference pattern used by the admin panel.
const validateActivity = (payload) => {
	const errors = [];
	const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
	const category = typeof payload?.category === 'string' ? payload.category.trim() : '';
	const description = typeof payload?.description === 'string' ? payload.description.trim() : '';
	const image = typeof payload?.image === 'string' ? payload.image.trim() : '';
	const duration = typeof payload?.duration === 'string' ? payload.duration.trim() : '';
	const estimatedCost = payload?.estimatedCost === undefined || payload?.estimatedCost === null ? 0 : Number(payload.estimatedCost);

	if (!name) errors.push('Activity name is required');
	if (!payload?.destination || !String(payload.destination).match(/^[0-9a-fA-F]{24}$/)) errors.push('Destination is required and must be a valid ID');
	if (estimatedCost < 0) errors.push('Estimated cost cannot be negative');
	if (payload?.description !== undefined && payload?.description !== null && typeof payload.description !== 'string') errors.push('Description must be a string');
	if (payload?.image !== undefined && payload?.image !== null && typeof payload.image !== 'string') errors.push('Image must be a string');

	return { errors, values: { name, category, description, image, duration, estimatedCost } };
};

const createActivity = async (req, res) => {
	const { errors, values } = validateActivity(req.body || {});
	if (errors.length) {
		return res.status(400).json({ success: false, message: errors[0] });
	}

	try {
		const activity = await Activity.create({
			name: values.name,
			destination: req.body.destination,
			category: values.category,
			description: values.description,
			image: values.image,
			duration: values.duration,
			estimatedCost: values.estimatedCost,
		});

		return res.status(201).json({ success: true, message: 'Activity created successfully', data: { activity } });
	} catch (error) {
		console.error(`Activity creation failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to create activity' });
	}
};

const getActivities = async (req, res) => {
	try {
		const activities = await Activity.find().populate('destination').sort({ createdAt: -1 });
		return res.status(200).json({ success: true, data: { activities } });
	} catch (error) {
		console.error(`Activity fetch failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch activities' });
	}
};

const getActivityById = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid activity ID' });
		}

		const activity = await Activity.findById(req.params.id).populate('destination');
		if (!activity) {
			return res.status(404).json({ success: false, message: 'Activity not found' });
		}

		return res.status(200).json({ success: true, data: { activity } });
	} catch (error) {
		console.error(`Activity lookup failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to fetch activity' });
	}
};

const updateActivity = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid activity ID' });
		}

		const activity = await Activity.findById(req.params.id);
		if (!activity) {
			return res.status(404).json({ success: false, message: 'Activity not found' });
		}

		const payload = req.body || {};
		const { errors, values } = validateActivity({
			name: payload.name ?? activity.name,
			destination: payload.destination ?? activity.destination,
			category: payload.category ?? activity.category,
			description: payload.description ?? activity.description,
			image: payload.image ?? activity.image,
			duration: payload.duration ?? activity.duration,
			estimatedCost: payload.estimatedCost ?? activity.estimatedCost,
		});

		if (errors.length) {
			return res.status(400).json({ success: false, message: errors[0] });
		}

		activity.name = values.name;
		activity.destination = payload.destination ?? activity.destination;
		activity.category = values.category;
		activity.description = values.description;
		activity.image = values.image;
		activity.duration = values.duration;
		activity.estimatedCost = values.estimatedCost;

		await activity.save();
		return res.status(200).json({ success: true, message: 'Activity updated successfully', data: { activity } });
	} catch (error) {
		console.error(`Activity update failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to update activity' });
	}
};

const deleteActivity = async (req, res) => {
	try {
		if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ success: false, message: 'Invalid activity ID' });
		}

		const activity = await Activity.findByIdAndDelete(req.params.id);
		if (!activity) {
			return res.status(404).json({ success: false, message: 'Activity not found' });
		}

		return res.status(200).json({ success: true, message: 'Activity deleted successfully' });
	} catch (error) {
		console.error(`Activity deletion failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to delete activity' });
	}
};

module.exports = { createActivity, getActivities, getActivityById, updateActivity, deleteActivity };
