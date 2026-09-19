const jwt = require('jsonwebtoken');

// Verifies Bearer tokens for protected routes that will be added later.
// The decoded user ID is attached to the request for downstream handlers.
const protect = (req, res, next) => {
	const authorization = req.headers.authorization;

	if (!authorization || !authorization.startsWith('Bearer ')) {
		return res.status(401).json({ success: false, message: 'Authentication token is required' });
	}

	const token = authorization.split(' ')[1];

	if (!token) {
		return res.status(401).json({ success: false, message: 'Authentication token is required' });
	}

	try {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decodedToken.userId;
		return next();
	} catch (error) {
		return res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
	}
};

module.exports = protect;
