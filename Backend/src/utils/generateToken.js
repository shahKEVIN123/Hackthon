const jwt = require('jsonwebtoken');

// Creates a signed JWT containing only the user's ID. The secret must come
// from the environment so it is not exposed in source control.
const generateToken = (userId) => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured');
	}

	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = generateToken;
