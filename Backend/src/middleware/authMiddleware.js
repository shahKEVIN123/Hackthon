const jwt = require('jsonwebtoken');

// Verifies JWT tokens for protected routes. The middleware accepts the common
// Bearer format while also tolerating tokens passed as plain strings so older
// clients can authenticate without breaking the secure user ownership checks.
const protect = (req, res, next) => {
	const authorization = req.headers.authorization;
	let token = null;

	if (authorization) {
		const authTrimmed = authorization.trim();
		if (authTrimmed.toLowerCase().startsWith('bearer')) {
			token = authTrimmed.substring(6).trim();
		} else {
			token = authTrimmed;
		}
	}

	if (!token) {
		return res.status(401).json({ success: false, message: 'Authentication token is required' });
	}

	try {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decodedToken.userId || decodedToken.id || decodedToken._id;
		return next();
	} catch (error) {
		return res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
	}
};

module.exports = protect;
