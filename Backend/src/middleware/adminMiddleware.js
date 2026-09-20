const User = require('../models/User');

// Ensures that only a verified admin can access the protected admin APIs.
// The middleware relies on req.userId being populated by the JWT middleware,
// never on any role or adminId sent by the client.
const adminOnly = async (req, res, next) => {
	if (!req.userId) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	try {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(401).json({ success: false, message: 'User not found' });
		}

		if (user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin access required' });
		}

		req.currentUser = user;
		return next();
	} catch (error) {
		console.error(`Admin authorization failed: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Unable to verify admin access' });
	}
};

module.exports = adminOnly;
