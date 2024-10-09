const express = require("express");
const router = express.Router();
const { developers } = require("../models/developer");

router.get("/", async (req, res) => {
  try {
    const result = await developers.find();
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
