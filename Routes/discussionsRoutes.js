const express = require("express");
const router = express.Router();

const { Discussions } = require("../models/discussions");

// Create a new discussion
router.post("/", async (req, res) => {
  try {
    const newDiscussion = req.body;
    const createdDiscussion = await Discussions.create(newDiscussion);
    res.status(201).json(createdDiscussion);
  } catch (error) {
    console.error("Error creating discussion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all discussions
router.get("/", async (req, res) => {
  try {
    const discussions = await Discussions.find();
    res.status(200).json(discussions);
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a discussion by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
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

// Update a discussion: views, likes, comments, and likes on comments
router.patch("/:discussionId", async (req, res) => {
  const { discussionId } = req.params;
  const { type, commentId, newComment, userId } = req.body;

  try {
    const discussion = await Discussions.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    switch (type) {
      case "incrementViews":
        discussion.views += 1;
        break;

      case "likeDiscussion":
        if (discussion.likes.includes(userId)) {
          return res.status(400).json({ message: "You already liked this discussion" });
        }
        discussion.likes.push(userId);
        break;

      case "reply":
        const newReply = {
          content: newComment,
          author: userId,
          createdAt: new Date(),
          likes: [], // For storing likes on the comment
        };
        discussion.replies.push(newReply);
        break;

      case "heartComment":
        const comment = discussion.replies.id(commentId);
        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.likes.includes(userId)) {
          return res.status(400).json({ message: "You already liked this comment" });
        }
        comment.likes.push(userId);
        break;

      default:
        return res.status(400).json({ message: "Invalid action type" });
    }

    await discussion.save();
    res.status(200).json(discussion);
  } catch (error) {
    console.error("Error updating discussion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
