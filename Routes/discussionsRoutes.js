const express = require("express");
const router = express.Router();

const { Discussions } = require("../models/discussions");

router.post("/", async (req, res) => {
  const newDiscussion = req.body;
  const result = await Discussions.create(newDiscussion);
  res.send(result);
});

router.get("/", async (req, res) => {
  const result = await Discussions.find();
  res.send(result);
});
// Route to get a discussion by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the discussion by slug
    const discussion = await Discussions.findOne({ slug });

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json(discussion);
  } catch (error) {
    console.error("Error fetching discussion by slug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Route to add a reply to a discussion
// Route to add a reply to a discussion
router.patch("/:discussionId", async (req, res) => {
  const { discussionId } = req.params; // Use discussionId from the request parameters
  const { replyId, content, author, email, profileImage } = req.body; // Expect content and author in the request body

  try {
    // Make sure to find the discussion using discussionId
    const discussion = await Discussions.findOneAndUpdate(
      { discussionId }, // Query using the custom discussionId
      {
        $push: {
          replies: {
            replyId,
            content,
            author,
            email,
            profileImage,
            createdAt: new Date(), // Set the current time for the reply
          },
        },
      },
      { new: true } // Return the updated discussion
    );

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json(discussion); // Return the updated discussion
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Increment views
// Increment views
router.patch("/:discussionId/incrementViews", async (req, res) => {
  try {
    const { discussionId } = req.params;

    // Increment the view count using the custom discussionId
    const updatedDiscussion = await Discussions.findOneAndUpdate(
      { discussionId }, // Use your custom field for the query
      { $inc: { views: 1 } }, // Increment the views field
      { new: true } // Return the updated document
    );

    if (!updatedDiscussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.status(200).json(updatedDiscussion); // Respond with the updated discussion
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
