const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};
exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;
    // Basic validation
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    // Create user
    const user = await User.create({
        username,
        password,
        role
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    // Check for user
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};
exports.getProfile = async (req, res) => {
    res.json(req.user);
};