const mongoose = require('mongoose');

// Activity records reference destination entries to avoid storing duplicated
// destination data while still supporting admin management and list views.
const activitySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Activity name is required'],
			trim: true,
		},
		destination: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Destination',
			required: [true, 'Destination is required'],
			index: true,
		},
		category: {
			type: String,
			trim: true,
			default: '',
		},
		description: {
			type: String,
			trim: true,
			default: '',
		},
		image: {
			type: String,
			default: '',
		},
		duration: {
			type: String,
			default: '',
		},
		estimatedCost: {
			type: Number,
			default: 0,
			min: [0, 'Estimated cost cannot be negative'],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
