const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const router = express.Router();

// Utility function to handle sending JWT
const sendTokenResponse = (user, res) => {
  const payload = { email: user.email };

  // Sign token with 1-day expiration
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  // Send token in response body
  res.json({ success: true, token, message: "Login successful" });
};

// Fetch all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const payload = { email: email };

    // Sign token with 1-day expiration
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    // Send token in response body
    res.send(token);
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  const { email, name } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists." });
    }
    // Create and save the new user
    const newUser = new User({ email, name });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

// Fetch specific user by email
router.get("/email", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
});

// Add new user (POST /users)
router.post("/", async (req, res) => {
  const { email, name ,role, profileImage } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Create and save the new user
    const newUser = new User({ email, name ,role, profileImage });
    
    await newUser.save();

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

module.exports = router;
