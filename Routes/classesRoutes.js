const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Fetch all classes
router.get('/', async (req, res) => {
    try {
        const classes = await Class.find();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post class to the database
router.post('/', async (req, res) => {
    const newClass = new Class(req.body);
    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Fetch all classes for a specific teacher by email
router.get('/teacher', async (req, res) => {
    // GET /classes/teacher?email=teacher@class.com
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required' });
    }
    try {
        // Query classes where teacher's email matches
        const classes = await Class.find({ 'teacher.email': email });
        if (classes.length === 0) {
            return res.status(404).json({ message: "No classes found for this teacher" });
        }
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
