const mongoose = require('mongoose');


const replySchema = new mongoose.Schema({
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
            required: true 
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});


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
        required: true 
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
        required: true 
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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    replies: [replySchema] 
}, { timestamps: true });

const Discussions = mongoose.model("Discussions", discussionSchema);

module.exports = { Discussions };
