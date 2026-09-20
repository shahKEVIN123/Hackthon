const mongoose = require('mongoose');

// Stores both the user-specific trip flow and the admin trip plan record in the
// same collection, while keeping the ownership model and planned itinerary fields.
const tripSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Trip owner is required'],
			index: true,
		},
		destination: {
			type: String,
			required: [true, 'Destination is required'],
			trim: true,
		},
		description: {
			type: String,
			default: '',
			trim: true,
		},
		coverImage: {
			type: String,
			default: '',
		},
		startDate: {
			type: Date,
			required: [true, 'Start date is required'],
		},
		endDate: {
			type: Date,
			required: [true, 'End date is required'],
		},
		duration: {
			type: Number,
			default: 1,
			min: [1, 'Duration must be a positive number'],
		},
		estimatedBudget: {
			type: Number,
			default: 0,
			min: [0, 'Estimated budget cannot be negative'],
		},
		currency: {
			type: String,
			default: 'USD',
			trim: true,
		},
		travelers: {
			type: Number,
			required: [true, 'Travelers is required'],
			min: [1, 'Travelers must be at least 1'],
		},
		status: {
			type: String,
			default: 'draft',
			enum: ['draft', 'published'],
		},
		featured: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
