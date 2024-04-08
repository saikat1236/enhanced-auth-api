const User = require('../models/User'); // Adjust the path as necessary

// Function to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Excluding passwords from the output
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
