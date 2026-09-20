require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedAdmin = require('./src/config/adminSeeder');

// Loads configuration, connects to MongoDB, and starts HTTP only after the
// database is ready so requests cannot arrive in a broken state.
const startServer = async () => {
	try {
		await connectDB();
		await seedAdmin();
		const port = process.env.PORT || 5000;
		app.listen(port, () => {
			console.log(`GlobeTrotter backend is running on port ${port}`);
		});
	} catch (error) {
		console.error(`Server startup failed: ${error.message}`);
		process.exitCode = 1;
	}
};

startServer();
