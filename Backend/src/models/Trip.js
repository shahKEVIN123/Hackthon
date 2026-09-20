const mongoose = require('mongoose');

// Stores a trip as a private record owned by the authenticated user. The
// structure keeps the core booking details stable while leaving room for future
// itinerary, budget, and sharing features without changing the ownership model.
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
		startDate: {
			type: Date,
			required: [true, 'Start date is required'],
		},
		endDate: {
			type: Date,
			required: [true, 'End date is required'],
		},
		travelers: {
			type: Number,
			required: [true, 'Travelers is required'],
			min: [1, 'Travelers must be at least 1'],
		},
		status: {
			type: String,
			default: 'draft',
			enum: ['draft'],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
