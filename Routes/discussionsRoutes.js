const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken")

const { Discussions } = require("../models/discussions");
const { default: mongoose } = require("mongoose");

router.post("/", async (req, res) => {
  const newDiscussion = req.body;
  const result = await Discussions.create(newDiscussion);
  res.send(result);
});

router.get("/categories", async (req, res) => {
  const result = await Discussions.distinct("category");
  res.send(result);
})

router.get("/",  async (req, res) => {
  const category = req.query.category
  const search = req.query.search
  const sort = req.query.sort

  let query = {}

  if (category) {
    query = {
      category: category
    }
  }

  if (search) {
    query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
      ]
    }
  }

  if (category === "All" && !search) {
    query = {}
  }

  const sortCriteria = {}

  if (sort === "newest") {
    sortCriteria.createdAt = -1
  }
  else if (sort === "oldest") {
    sortCriteria.createdAt = 1
  }
  else if (sort === "asc") {
    sortCriteria.title = 1
  }
  else if (sort === "desc") {
    sortCriteria.title = -1
  }

  const result = await Discussions.find(query).sort(sortCriteria);

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
  const { discussionId } = req.params; // Get discussionId from URL params
  const { replyId, content, author } = req.body; // Destructure body fields

  try {
    // Find and update the discussion with the new reply
    const discussion = await Discussions.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(discussionId) }, // Find discussion by ID
      {
        $push: {
          replies: {
            replyId, // Set replyId
            content, // Reply content
            author,
            createdAt: new Date(), // Set the current timestamp for the reply
            likes: [], // Initialize with an empty array of likes
          },
        },
      },
      { new: true } // Return the updated discussion after adding the reply
    );

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Return the updated discussion with the new reply
    res.status(200).json(discussion);
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
      { _id: discussionId }, // Use your custom field for the query
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
