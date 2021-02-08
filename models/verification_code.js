const mongoose = require('mongoose');
const Schema = mongoose.Schema;
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}


const expired_at=new Date().addHours(0.5);
const verificationSchema=new Schema({
   code:{
       type:String,
       required:true,
   } ,
    user_id:{
       type:mongoose.Schema.Types.ObjectID,
        ref:"users"
    },
    created_at:{
      type:Date,
        default:Date.now
    },
    expire_at:{
       type:Date,
        default: expired_at
    }
}, {timestamp:true});

module.exports = User = mongoose.model("verification_code", verificationSchema);
