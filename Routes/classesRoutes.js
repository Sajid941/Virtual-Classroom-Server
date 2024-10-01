const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Class = require("../models/Class");

// Middleware for authentication (example, assuming JWT)
const authMiddleware = require("../middleware/auth"); // Ensure this exists and populates req.user

// Fetch all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post class to the database (with authentication)
router.post("/", authMiddleware, async (req, res) => {
  const newClass = new Class(req.body);
  
  // Ensure the logged-in user is the one sending the request
  if (req.user.email === req.body.teacherEmail) {
    try {
      const savedClass = await newClass.save();
      res.status(201).json(savedClass);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    return res.status(403).json({ message: "Forbidden access." });
  }
});

// Fetch all classes for a specific teacher by email
router.get("/teacher", authMiddleware, async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required" });
  }

  // Check if the logged-in user is querying their own classes
  if (req.user.email === email) {
    try {
      const classes = await Class.find({ "teacher.email": email });
      if (classes.length === 0) {
        return res.status(404).json({ message: "No classes found for this teacher" });
      }
      res.json(classes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(403).json({ message: "Forbidden access." });
  }
});

// Fetch all classes for a specific student by email
router.get("/student", authMiddleware, async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required" });
  }

  // Check if the logged-in user is querying their own classes
  if (req.user.email === email) {
    try {
      const classes = await Class.find({ "students.email": email });
      if (classes.length === 0) {
        return res.status(404).json({ message: "No classes found for this student" });
      }
      res.json(classes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(403).json({ message: "Forbidden access." });
  }
});

// Fetch class by classId
router.get("/classid", async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ message: "classId query parameter is required" });
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

// Multer setup for file uploads with file type validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../assignmentUploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf|doc|docx/; // Adjust file types as necessary
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF and DOC/DOCX files are allowed!"));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Patch for adding assignment
router.patch("/:classId", upload.single("file"), async (req, res) => {
  const { classId } = req.params;
  const { title, description, dueDate } = req.body;

  if (!title || !description || !dueDate || !req.file) {
    return res.status(400).json({ message: "Missing required fields for the assignment" });
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

    res.status(200).json({ message: "Assignment added successfully", updatedClass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patch students to a class (append to existing students list)
router.patch("/:classId/students", authMiddleware, async (req, res) => {
  const { classId } = req.params;
  const { students } = req.body;

  try {
    const classData = await Class.findOneAndUpdate(
      { classId },
      { $addToSet: { students: { $each: students } } }, // Ensure no duplicate students
      { new: true }
    );

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ message: "Failed to add students", error });
  }
});

module.exports = router;
