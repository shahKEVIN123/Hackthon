const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Enables cross-origin requests for the future frontend and parses JSON bodies.
app.use(cors());
app.use(express.json());

// Provides a lightweight status endpoint for health checks and local testing.
app.get('/', (req, res) => {
	res.status(200).json({ success: true, message: 'GlobeTrotter Backend is running' });
});

// Mounts all authentication endpoints under the requested API prefix.
app.use('/api/auth', authRoutes);

// Converts malformed JSON and unexpected errors into consistent API responses.
app.use((error, req, res, next) => {
	if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
		return res.status(400).json({ success: false, message: 'Request body must contain valid JSON' });
	}

	console.error(`Unhandled server error: ${error.message}`);
	return res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
