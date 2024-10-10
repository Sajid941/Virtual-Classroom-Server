const mongoose = require('mongoose');

messageSchema = new mongoose.Schema({
    sender:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    }

})

chatSchema = new mongoose.Schema({
    classroomId:{
        type: String,
        required: true
    },
    message:[messageSchema]
})

const Chat = mongoose.model('chats', chatSchema);
module.exports = {Chat}