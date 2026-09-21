const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
	const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	const password = process.env.ADMIN_PASSWORD;

	if (!email || !password) {
		console.warn('Warning: ADMIN_EMAIL and ADMIN_PASSWORD are not configured. Skipping admin account seeding.');
		return;
	}

	const passwordHash = await bcrypt.hash(password, 12);
	const admin = await User.findOneAndUpdate(
		{ email },
		{
			$set: {
				firstName: 'Admin',
				lastName: 'User',
				phoneNumber: '+10000000000',
				city: 'GlobeTrotter',
				country: 'Global',
				role: 'admin',
				password: passwordHash,
			},
			$setOnInsert: { email },
		},
		{ returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
	);

	console.log(`Admin account ready: ${admin.email}`);
};

module.exports = seedAdmin;