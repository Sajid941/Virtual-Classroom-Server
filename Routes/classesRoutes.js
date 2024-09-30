const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Class = require("../models/Class");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Logger Middleware
const logger = (req, res, next) => {
  next();
};

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    console.log(req.user);
    next();
  });
};

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
router.post("/",logger,verifyToken, async (req, res) => {
  const newClass = new Class(req.body);
  if (req.user.email === req.query.email) {
    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
  } else {
    return res.status(403).send({ message: "Forbidden access." });
  }
  
});

// Fetch all classes for a specific teacher by email
router.get("/teacher", verifyToken, async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }
  console.log(req.user.email);
  if (req.user.email === req.query.email) {
    try {
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
  } else {
    return res.status(403).send({ message: "Forbidden access." });
  }
});

// Fetch all classes for a specific student by email
router.get("/student", logger, verifyToken, async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }
  if (req.user.email === req.query.email) {
    try {
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
  } else {
    return res.status(403).send({ message: "Forbidden access." });
  }
});

// Fetch class by classId
router.get("/classid", async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ message: "classId query parameter is required" });
  }
  try {
    const classe = await Class.findOne({ classId: id });
    if (!classe) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../assignmentUploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Patch for adding assignment
router.patch("/:classId", upload.single("file"), async (req, res) => {
  const { classId } = req.params;
  const { title, description, dueDate } = req.body;

  if (!title || !description || !dueDate || !req.file) {
    return res
      .status(400)
      .json({ message: "Missing required fields for the assignment" });
  }

  const fileUrl = `/assignmentUploads/${req.file.filename}`;

  const newAssignment = {
    title,
    description,
    dueDate,
    fileUrl,
  };

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { classId: classId },
      { $push: { assignments: newAssignment } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res
      .status(200)
      .json({ message: "Assignment added successfully", updatedClass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patch students to a class
router.patch("/:classId/students", async (req, res) => {
  const { classId } = req.params;
  const { students } = req.body;

  try {
    const classData = await Class.findOne({ classId });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    classData.students = students;
    const updatedClass = await classData.save();

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: "Failed to add students", error });
  }
});

module.exports = router;
