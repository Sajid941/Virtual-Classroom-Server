const mongoose = require("mongoose");

// Message schema for students' messages and replies
const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      user: String,
      text: String,
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Student schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  messages: [messageSchema], // Array of messages
});

// Resource schema
const resourceSchema = new mongoose.Schema({
  resourceId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["ZIP", "Code", "Comments"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Teacher schema
const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

// Submitted assignment schema
const assignmentsSubmissions = new mongoose.Schema({
  student_name: {
    type: String,
    required: true,
  },
  student_email: {
    type: String,
    required: true,
  },
  submit_file: {
    type: Object,
    required: true,
  },
  submitAt: {
    type: Date,
    required: true,
  },
  student_marks: {
    type: Number,
    required: true,
  },
  assignment_feedback: {
    type: String,
    require: true,
  },
});

// Assignment schema
const assignmentSchema = new mongoose.Schema({
  assignmentId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  added_file: {
    type: Object,
    required: true,
  },
  classId: {
    type: String,
    required: true,
  },
  assignmentSubmissions: [assignmentsSubmissions], // array of assignment submitted students
});

// Quiz schema
const quizSubmissions = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  answers: {
    type: [Array], // Array to hold student answers
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String], // Array of options for the question
    required: true,
  },
  correctAnswer: {
    type: String, // The correct answer for the question
    required: true,
  },
});
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  questions: [
    // Array of quiz questions
    questionSchema,
  ],
  submissions: [
    // Array of quiz submissions
    quizSubmissions,
  ],
});

// Class schema
const classSchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true,
    unique: true,
  },
  className: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  teacher: teacherSchema, // Embedding teacher schema
  classImage: {
    type: String,
    required: true,
  },
  resources: [resourceSchema], // Array of resources
  students: [studentSchema], // Array of students
  assignments: [assignmentSchema], // Array of assignments
  quizzes: [quizSchema], // Array of quizzes
  meetLink: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Exporting the class model
const Class = mongoose.model("Class", classSchema);

module.exports = Class;
