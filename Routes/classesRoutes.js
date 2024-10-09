const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Class = require("../models/Class");
const fs = require("fs");

// Middleware for authentication
const authMiddleware = require("../middleware/auth");

// Upload directory
const uploadDir = process.env.UPLOAD_DIR || "/tmp/assignmentUploads"; // Use /tmp for serverless environments

// Ensure 'assignmentUploads' directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for teachers assignment uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /pdf|doc|docx/; // Allowed file types
  const isValidExt = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isValidMime = allowedFileTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOC/DOCX files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

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
  // Ensure the logged-in user is the one sending the request
  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Fetch classes for a specific teacher
router.get("/teacher", authMiddleware, async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }

  if (req.user.email === email) {
    try {
      const classes = await Class.find({ "teacher.email": email });
      res
        .status(classes.length ? 200 : 404)
        .json(
          classes.length
            ? classes
            : { message: "No classes found for this teacher" }
        );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(403).json({ message: "Forbidden access." });
  }
});

// Fetch classes for a specific student
router.get("/student", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }

  try {
    const classes = await Class.find({ "students.email": email });
    res
      .status(classes.length ? 200 : 404)
      .json(
        classes.length
          ? classes
          : { message: "No classes found for this student" }
      );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch class by classId
router.get("/classid", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ message: "classId query parameter is required" });
  }

  try {
    const classe = await Class.findOne({ classId: id });
    res
      .status(classe ? 200 : 404)
      .json(classe || { message: "Class not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patch for adding assignment
router.patch("/:classId", upload.single("file"), async (req, res) => {
  const { classId } = req.params;
  const { title, description, marks, dueDate } = req.body;

  if (!title || !description || !marks || !dueDate || !req.file) {
    return res
      .status(400)
      .json({ message: "Missing required fields for the assignment" });
  }

  const marksInt = parseInt(marks);

  const fileUrl = `/assignmentUploads/${req.file.filename}`;

  const newAssignment = {
    title,
    description,
    dueDate,
    fileUrl,
  };

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { classId },
      { $push: { assignments: newAssignment } },
      { new: true }
    );

    res
      .status(updatedClass ? 200 : 404)
      .json(
        updatedClass
          ? { message: "Assignment added successfully", updatedClass }
          : { message: "Class not found" }
      );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patch students to a class
router.patch("/:classId/students", async (req, res) => {
  const { classId } = req.params;
  const { students } = req.body;

  try {
    const classData = await Class.findOneAndUpdate(
      { classId },
      { $addToSet: { students: { $each: students } } },
      { new: true }
    );

    res
      .status(classData ? 200 : 404)
      .json(classData || { message: "Class not found" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add students", error });
  }
});

// Patch for updating meet link
router.patch("/:classId/meetlink", async (req, res) => {
  const { classId } = req.params;
  const { meetLink } = req.body;

  if (!meetLink) {
    return res.status(400).json({ message: "meetLink is required" });
  }

  const classData = await Class.findOneAndUpdate(
    { classId },
    { $set: { meetLink } },
    { new: true, upsert: true }
  );

  res
    .status(classData ? 200 : 404)
    .json(classData || { message: "Class not found" });
});

// Get meet link for a class
router.get("/meetlink", async (req, res) => {
  const { classId } = req.query;

  if (!classId) {
    return res
      .status(400)
      .json({ message: "classId query parameter is required" });
  }

  try {
    const classData = await Class.findOne({ classId });

    if (!classData || !classData.meetLink) {
      return res
        .status(404)
        .json({ message: "Meet link not found for this class" });
    }

    res.status(200).json({ meetLink: classData.meetLink });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meet link", error });
  }
});

// Route to download assignment files
router.get("/download/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error downloading file", err });
      }
    });
  });
});


// route to submit assignment of students
router.patch(
  "/:classId/assignments/:assignmentId/submissions",
  async (req, res) => {
    const { classId, assignmentId } = req.params;
    const { assignment_name, student_name, student_email, submit_file } =
      req.body;

    if (!assignment_name || !student_name || !student_email || !submit_file) {
      return res
        .status(400)
        .json({ message: "Missing input data for submission" });
    }

    const newAssignmentSubmission = {
      assignment_name,
      student_name,
      student_email,
      submit_file,
      submitAt: new Date(),
    };

    try {
      const updatedClass = await Class.findOneAndUpdate(
        {
          classId: classId,
          "assignments._id": assignmentId,
        },
        { $push: { "assignments.$.submissions": newAssignmentSubmission } },
        { new: true }
      );

      if (!updatedClass) {
        return res.status(404).json({ message: 'Class or Assignment not found' });
      }
  
      res.status(200).json({ message: 'Submitted successfully', updatedClass });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
module.exports = router;
