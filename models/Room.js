const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    room_id:{
        type:String,
        required:true
    }
})

module.exports = Room = mongoose.model('rooms', RoomSchema)