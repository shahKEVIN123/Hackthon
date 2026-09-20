const mongoose = require('mongoose');

// Destination records are kept lightweight so the admin panel can manage
// destination entries with minimal duplication and no unnecessary fields.
const destinationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Destination name is required'],
			trim: true,
		},
		country: {
			type: String,
			trim: true,
		},
		region: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			default: '',
			trim: true,
		},
		image: {
			type: String,
			default: '',
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Destination', destinationSchema);
