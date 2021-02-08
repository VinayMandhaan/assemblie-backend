const mongoose = require('mongoose');
const Schema= mongoose.Schema;


const AuthSchema= new Schema({
   superAdmin:{
       type:Boolean,
       default:false
   } ,
    assembler:{
       type:Boolean,
        default:false,
    },
    assemble:{
       type:Boolean,
        default:true
    }
}, {timestamp:true});

module.exports = Auth_Type = mongoose.model("Auth_Type", AuthSchema);

