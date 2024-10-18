const express = require("express");
const router = express.Router();
const Class = require("../models/Class");

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
      res
        .status(classData ? 200 : 404)
        .json(classData || { message: "Class not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add quiz", error });
    }
  });
  //checking if already quiz taken
  router.get("/:classId/quizsubmission/:studentEmail", async (req, res) => {
    const { classId, studentEmail } = req.params;
  
    // Find the class by classId
    const classData = await Class.findOne({ classId });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
  
    // Find the quiz (You can modify the logic to identify the correct quiz)
    const quiz = classData.quizzes[0];
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
  
  
    // If the student has already submitted, return the submission data
    const submission = quiz.submissions.find(
      (submission) => submission.studentEmail === studentEmail
    );
    console.log(submission);
    if(submission){
  
      return res.status(200).json({
        message: "Student has already submitted this quiz",
        submission // Return the submission data
      });
    }
    res.status(404).json({message: "Student has not submitted this quiz"});
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
        
        // Step 4: Target the first quiz in the quizzes array
        const quiz = classData.quizzes[0];
        
        // Step 6: Push the submissionData (student's quiz submission) into the submissions array
        quiz.submissions.push(submissionData);
        
        // Step 7: Save the updated class data
        await classData.save();
        console.log(classData);
  
      // Step 8: Return the updated class data with success response
      res.status(200).json(classData);
    } catch (error) {
      console.error("Error updating quiz submissions:", error);
      res
        .status(500)
        .json({ message: "Failed to update quiz submissions", error });
    }
  });
  
module.exports = router;