const mongoose = require('mongoose')

const StreamingScheema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectID,
         ref:"users"
     },
    stream_key:{
        type:String,
    },
    playbackId:{
        type:String,
    },
    status:{
        type:String,
    },
    title:{
        type:String,
    },
    description:{
        type:String,
    },
    categories:{
        type:String
    },
    paid:{
        type:Boolean
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports = Streaming = mongoose.model('streamings', StreamingScheema)