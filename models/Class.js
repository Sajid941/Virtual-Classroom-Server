const mongoose = require('mongoose');

// Message schema for students' messages and replies
const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  replies: [
    {
      user: String,
      text: String,
      time: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

// Student schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  messages: [messageSchema] // Array of messages
});

// Resource schema
const resourceSchema = new mongoose.Schema({
  resourceId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ZIP', 'Code', 'Comments'],
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

// Teacher schema
const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

// Class schema
const classSchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true,
    unique: true
  },
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  teacher: teacherSchema, // Embedding teacher schema
  classImage: {
    type: String,
    required: true
  },
  resources: [resourceSchema], // Array of resources
  students: [studentSchema], // Array of students
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Exporting the class model
const Class = mongoose.model('Class', classSchema);

module.exports = Class;
