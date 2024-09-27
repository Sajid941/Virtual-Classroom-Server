const mongoose = require('mongoose');

// Define the reply schema
const replySchema = new mongoose.Schema({
    replyId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

// Define the author schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    }
});

// Define the discussion schema
const discussionSchema = new mongoose.Schema({
    discussionId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: authorSchema,
    createdAt: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    replies: [replySchema] // Array of replies
}, { timestamps: true });

const Discussions = mongoose.model("Discussions", discussionSchema);
module.exports = { Discussions };
