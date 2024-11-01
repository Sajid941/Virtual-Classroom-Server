const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const Class = require("../models/Class");

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for added assignment
const addedAssignmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ClassNet/added-assignments',
    resource_type: 'auto', // Ensures PDFs, DOCX, etc., are treated correctly
    use_filename: true, // Preserve original filename
  },
});

const addedAssignments = multer({ storage: addedAssignmentStorage });

// Patch for adding assignment
router.patch("/:classId", addedAssignments.single("file"), async (req, res) => {
  const { classId } = req.params;
  const { title, description, marks, end } = req.body;

  if (!title || !description || !marks || !end || !req.file) {
    return res
      .status(400)
      .json({ message: "Missing required fields for the assignment" });
  }

  const marksInt = parseInt(marks);

  const { originalname, path, filename } = req.file;

  const newAssignment = {
    classId,
    title,
    description,
    marks: marksInt,
    start: new Date(),
    end,
    added_file: { originalname, filename, path },
  };

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { classId: classId },
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
    res.status(500).json({ message: `${err.message},500 error` });
  }
});

// Multer submit assignments storage configuration for Cloudinary 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ClassNet/assignment-submissions',
    resource_type: 'auto', // Ensures PDFs, DOCX, etc., are treated correctly
    use_filename: true, // Preserve original filename
    // unique_filename: false, // Avoid random strings in the filename
  },
});

const upload = multer({ storage });

// Route to submit assignment
router.patch(
  '/:classId/assignments/:assignmentId/submissions',
  upload.single('submit_file'), // Handle a single file upload
  async (req, res) => {
    const { classId, assignmentId } = req.params;
    const { student_name, student_email } = req.body;

    // Validate input data
    if (!student_name || !student_email || !req.file) {
      return res.status(400).json({ message: 'Missing input data for submission' });
    }

    // Destructure file info from req.file
    const { originalname, path, filename } = req.file;

    const newAssignmentSubmission = {
      student_name,
      student_email,
      submit_file: { originalname, filename, path },
      submitAt: new Date(),
    };

    try {
      // Push the new submission to the specific assignment in the class
      const updatedClass = await Class.findOneAndUpdate(
        { classId, 'assignments._id': assignmentId },
        {
          $push: {
            'assignments.$.assignmentSubmissions': newAssignmentSubmission,
          },
        },
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
