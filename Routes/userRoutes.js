const express = require('express');
const router=express.Router();
const User=require('../models/Users');

//fetch all users
router.get('/',async (req,res) => {
    // GET /users
    try {
        const users= await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
})

//post user to database

router.post('/',async (req,res) => {
    const user=new User(req.body);
    try {
        const existingUser = await User.findOne({email: user.email})
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const newUser=await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
})

//fetch specific user by email
router.get('/email',async (req,res) => {

    // GET /users/email?email=john@example.com
    const email=req.query.email;
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required' });
    }
    try {
        const user= await User.findOne({ email: email });
        res.json(user);
    } catch (err) {
        res.status(404).json({message: "user not found", error: err});
    }
})

module.exports = router;