const mongoose = require("mongoose");

exports.connect = () => {
	// Connecting to the database
	mongoose
		.connect('mongodb://localhost/learnmongo', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log("Successfully connected to database");
		})
		.catch((error) => {
			console.log("database connection failed");
			console.error(error);
		});
};