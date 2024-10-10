const express = require('express');
const router = express.Router();

const { Chat } = require('../models/chat');

router.patch('/', async (req, res) => {
    const { classroomId, message } = req.body; 

    try {
        
        const result = await Chat.findOneAndUpdate(
            { classroomId }, 
            { $push: { message } }, 
            { new: true, upsert: true } 
        );

        res.send(result); 
    } catch (err) {
        console.error('Error updating chat:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router