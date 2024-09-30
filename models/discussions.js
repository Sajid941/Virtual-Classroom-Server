const mongoose = require('mongoose');


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
        name: {
            type: String,
            required: true
        },
        profilePic: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true // Email added to the reply author
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array of users who liked the reply
});

// Define the author schema (to be embedded in both discussions and replies)
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true // Email added to the author
    }
});


const discussionSchema = new mongoose.Schema({
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
    author: {
        type: authorSchema,
        required: true // Embedding the author schema for the discussion
    },
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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users who liked the discussion
    replies: [replySchema] // Array of replies (each with its own author schema and likes)
}, { timestamps: true });

const Discussions = mongoose.model("Discussions", discussionSchema);
module.exports = { Discussions };
