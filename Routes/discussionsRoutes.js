const express = require('express');
const router = express.Router()

const {Discussions} = require('../models/discussions');

router.post("/", async(req,res)=>{
    const newDiscussion = req.body;
    const result = await Discussions.create(newDiscussion)
    res.send(result)
})

router.get("/",async(req,res)=>{
    const result = await Discussions.find()
    res.send(result)
})
// Route to get a discussion by slug
router.get('/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
  
      // Find the discussion by slug
      const discussion = await Discussions.findOne({ slug });
  
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }
  
      res.status(200).json(discussion);
    } catch (error) {
      console.error("Error fetching discussion by slug:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router