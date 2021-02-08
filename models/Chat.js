const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    room:{
        type:String,
        required:true
    }
})

module.exports = Chat = mongoose.model('chats', ChatSchema)