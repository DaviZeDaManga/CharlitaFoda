const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

const MessageModel = mongoose.model("Message", messageSchema)
module.exports = MessageModel