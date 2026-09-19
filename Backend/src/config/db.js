const mongoose = require('mongoose');

// Connects the application to MongoDB using the connection string stored in
// the environment. Keeping this logic here makes startup easy to test and reuse.
const connectDB = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI is not configured');
	}

	try {
		const connection = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${connection.connection.host}`);
	} catch (error) {
		console.error(`MongoDB connection failed: ${error.message}`);
		throw error;
	}
};

module.exports = connectDB;
