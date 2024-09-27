const mongoose = require('mongoose');

const author = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    authorImage: {
        type: String,
        required: true
    }
})

const discussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    author: [author],
    view: {
        type: Number
    },

},{timestamps:true} )

const discussions = mongoose.model("discussions", discussionSchema)
module.exports = { discussions }