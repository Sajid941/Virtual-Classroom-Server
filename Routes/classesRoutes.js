const express = require("express");
const router = express.Router();
const Class = require("../models/Class");

// Fetch all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post class to the database
router.post("/", async (req, res) => {
  const newClass = new Class(req.body);
  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Fetch all classes for a specific teacher by email
router.get("/teacher", async (req, res) => {
  // GET /classes/teacher?email=teacher@class.com
  const email = req.query.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }
  try {
    // Query classes where teacher's email matches
    const classes = await Class.find({ "teacher.email": email });
    if (classes.length === 0) {
      return res
        .status(404)
        .json({ message: "No classes found for this teacher" });
    }
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/student", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }
  try {
    // Find classes where the student's email exists
    const classes = await Class.find({ "students.email": email });
    if (classes.length === 0) {
      return res
        .status(404)
        .json({ message: "No classes found for this student" });
    }
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/classid", async (req, res) => {
  // GET /classes/classid?id=c001
  const id = req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ message: "classId query parameter is required" });
  }
  try {
    // Query classes where teacher's email matches
    const classe = await Class.findOne({ classId: id });
    if (classe.length === 0) {
      return res
        .status(404)
        .json({ message: "No classes found for this teacher" });
    }
    res.json(classe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Patch students to a class
router.patch("/:classId/students", async (req, res) => {
  const { classId } = req.params;
  const { students } = req.body;

  try {
    // Find class by its ID
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Add new students to the class
    classData.students = students;

    // Save the updated class
    const updatedClass = await classData.save();

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: "Failed to add students", error });
  }
});

module.exports = router;
