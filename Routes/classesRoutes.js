const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Class = require("../models/Class");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Nodemailer transporter setup for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rkshawn975@gmail.com", // Your Gmail address
    pass: process.env.NODE_MAILER_PASS, // Your App password or regular password if less secure apps are enabled
  },
});

// Function to send email notification
const sendEmailNotification = async (
  teacherName,
  teacherEmail,
  className,
  classid
) => {
  const mailOptions = {
    from: "rkshawn975@gmail.com", // Sender's email address
    to: teacherEmail, // Recipient's email (the teacher's email)
    subject: `Class Created Successfully: ${className}`, // Subject of the email
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="text-align: center; color: #4CAF50;">Class Created Successfully!</h2>
        <p>Dear <strong>${teacherName}</strong>,</p>
        <p>We are excited to inform you that your class "<strong>${className}</strong>" has been successfully created.</p>
        <p><strong>Class Code:</strong> <span style="background-color: #f5f5f5; padding: 5px 10px; border-radius: 4px;">${classid}</span></p>
        <p>Here are the details:</p>
        <ul>
          <li><strong>Class Name:</strong> ${className}</li>
          <li><strong>Class ID:</strong> ${classid}</li>
        </ul>
        <p>We wish you all the best in your teaching journey!</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #777;">If you have any questions, feel free to contact us at <a href="mailto:support@classnet.com" style="color: #4CAF50;">support@classnet.com</a>.</p>
        <p style="font-size: 12px; color: #777;">Thank you for using ClassNet!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

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
  //get teachers email, subject and class code
  const teacherName = req.body.teacher.name;
  const teacherEmail = req.body.teacher.email;
  const classId = req.body.classId;
  const subject = req.body.subject;

  // Ensure the logged-in user is the one sending the request
  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);

    //send email email notifications to teachers account
    sendEmailNotification(teacherName, teacherEmail, subject, classId);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Fetch classes for a specific teacher
router.get("/teacher", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
    e;
  }

  // if (req.user.email === email) {
  try {
    const classes = await Class.find({ "teacher.email": email });
    res.send(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // } else {
  //   res.status(403).json({ message: "Forbidden access." });
  // }
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
    res.send(classes);
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
    marks: marksInt,
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
router.patch("/:classId/quiz", async (req, res) => {
  const { classId } = req.params;
  const { quiz } = req.body; // Assuming quiz is an object or an array of quiz objects
  try {
    const classData = await Class.findOneAndUpdate(
      { classId },
      {
        $addToSet: { quizzes: { $each: Array.isArray(quiz) ? quiz : [quiz] } },
      },
      { new: true, upsert: true } // Enable upsert
    );
    console.log(classData);
    res
      .status(classData ? 200 : 404)
      .json(classData || { message: "Class not found" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add quiz", error });
  }
});
router.patch("/:classId/quizsubmission", async (req, res) => {
  const { classId } = req.params; // The class we are targeting
  const { submissionData } = req.body; // submissionData contains student's submission

  try {
    // Step 1: Find the class by classId
    const classData = await Class.findOne({ classId });

    // Step 2: Check if the class exists
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Step 3: Check if there is at least one quiz in the quizzes array
    if (classData.quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found in this class" });
    }

    // Step 4: Target the first quiz in the quizzes array
    const quiz = classData.quizzes[0];

    // Step 5: If the quiz doesn't have a submissions field, initialize it as an empty array
    if (!quiz.submissions) {
      quiz.submissions = [];
    }

    // Step 6: Push the submissionData (student's quiz submission) into the submissions array
    quiz.submissions.push(submissionData);

    // Step 7: Save the updated class data
    await classData.save();

    // Step 8: Return the updated class data with success response
    res.status(200).json(classData);
  } catch (error) {
    console.error("Error updating quiz submissions:", error);
    res
      .status(500)
      .json({ message: "Failed to update quiz submissions", error });
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

// multer storage for submitted assignment
// const submitDir = path.join(__dirname, '../submittedAssignments');
const submitDir = process.env.SUBMIT_DIR || "/tmp/submittedAssignments";

// Ensure 'submittedAssignments' directory exists
if (!fs.existsSync(submitDir)) {
  fs.mkdirSync(submitDir, { recursive: true });
}

// Multer setup for student assignment submit
const submitAssignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, submitDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const submit = multer({ storage: submitAssignmentStorage });
// route to submit assignment of students
router.patch(
  "/:classId/assignments/:assignmentId/submissions",
  submit.single("submit_file"),
  async (req, res) => {
    const { classId, assignmentId } = req.params;
    const { assignment_name, student_name, student_email } = req.body;

    if (!assignment_name || !student_name || !student_email || !req.file) {
      return res
        .status(400)
        .json({ message: "Missing input data for submission" });
    }

    const fileUrl = `/submittedAssignments/${req.file.filename}`;

    const newAssignmentSubmission = {
      assignment_name,
      student_name,
      student_email,
      submit_file: fileUrl,
      submitAt: new Date(),
    };

    try {
      const updatedClass = await Class.findOneAndUpdate(
        {
          classId: classId,
          "assignments._id": assignmentId,
        },
        {
          $push: {
            "assignments.$.assignmentSubmissions": newAssignmentSubmission,
          },
        },
        { new: true }
      );

      if (!updatedClass) {
        return res
          .status(404)
          .json({ message: "Class or Assignment not found" });
      }

      res.status(200).json({ message: "Submitted successfully", updatedClass });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Route to download submitted assignment files
router.get("/submitted-file-download/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(submitDir, filename);

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

// Route to get all assignment submissions of classes based on user role
router.get("/user-submissions", async (req, res) => {
  try {
    const { email, role, className, assignmentName, search } = req.query;

    // Query based on role
    let query = role === "teacher"
        ? { "teacher.email": email }
        : { "students.email": email };

    // Only apply filters if valid values are provided
    if (className && className !== "Select Class") {
      query["className"] = { $regex: className, $options: "i" };
    }
    if (assignmentName && assignmentName !== "Select Assignment") {
      query["assignments.title"] = { $regex: assignmentName, $options: "i" };
    }
    if (search) {
      query.$or = [
        { "assignments.title": { $regex: search, $options: "i" } },
        {
          "assignments.assignmentSubmissions.student_name": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const userClasses = await Class.find(query);

    if (!userClasses.length) {
      return res
        .status(404)
        .json({ message: "No classes found for this user." });
    }

    // Aggregate all submissions from the classes
    const submissions = userClasses.flatMap((cls) =>
      cls.assignments.flatMap((assignment) =>
        assignment.assignmentSubmissions.map((submission) => ({
          className: cls.className,
          assignmentName: assignment.title,
          ...submission._doc,
        }))
      )
    );

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
