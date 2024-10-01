const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const router = express.Router();

// Fetch all users
router.get('/', async (req, res) => {
    // GET /users
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User login
router.post("/login", async (req, res) => {
    const { email } = req.body;
  
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email." });
        }

        // Generate JWT token
        const payload = { email: user.email };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d", // Token expires in 1 day
        });

        // Send token as a cookie
        res
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            })
            .send({ success: true, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});

// Register a new user
router.post("/register", async (req, res) => {
    const { email, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
    }

    // Create a new user
    const newUser = new User({
        email,
        name,
        // Password could be added if you plan to have password login later
    });

    try {
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// Fetch specific user by email
router.get('/email', async (req, res) => {
    // GET /users/email?email=john@example.com
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required' });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user", error: err });
    }
});

module.exports = router;
