const mongoose  = require('mongoose');

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true
    },
    facebook: {
        type: String
    },
    linkedin: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
})
const developers = mongoose.model("developers",developerSchema)
module.exports={developers}