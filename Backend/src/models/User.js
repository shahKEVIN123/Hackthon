const mongoose = require('mongoose');

// Defines the user data stored for authentication and the user's basic profile.
// Password reset fields are internal and are never included in safe API output.
const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'First name is required'],
			trim: true,
			minlength: [2, 'First name must be at least 2 characters'],
			maxlength: [50, 'First name cannot exceed 50 characters'],
		},
		lastName: {
			type: String,
			required: [true, 'Last name is required'],
			trim: true,
			minlength: [2, 'Last name must be at least 2 characters'],
			maxlength: [50, 'Last name cannot exceed 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
		},
		phoneNumber: {
			type: String,
			required: [true, 'Phone number is required'],
			trim: true,
		},
		city: { type: String, required: [true, 'City is required'], trim: true },
		country: { type: String, required: [true, 'Country is required'], trim: true },
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		password: { type: String, required: [true, 'Password is required'], select: false },
		resetPasswordToken: { type: String, select: false },
		resetPasswordExpires: { type: Date, select: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
