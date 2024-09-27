const express = require('express');
const router = express.Router()

const {discussions} = require('../models/discussions');

router.post("/", async(req,res)=>{
    const newDiscussion = req.body;
    const result = await discussions.create(newDiscussion)
    res.send(result)
})

router.get("/",async(req,res)=>{
    const result = await discussions.find()
    res.send(result)
})

module.exports = router