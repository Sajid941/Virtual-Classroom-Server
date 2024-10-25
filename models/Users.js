const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    default: "student",
  },
  profileImage: {
    type: String,
    default:"https://i.postimg.cc/CLkQzVS1/user-1.png",
  },
  userType: {
    type: String,
    enum: ["normal", "premium"],
    default: "normal",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  transactionId: {
    type: String,
  }
});

module.exports = mongoose.model("User", userSchema);