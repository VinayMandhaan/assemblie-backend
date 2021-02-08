const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
   first_name:{
       type:String,
       required:true
   },
   last_name:{
        type:String,
        required:true
   },
   username:{
       type:String,
       required: true,
       // unique:true,
   } ,
    email:{
       type:String,
        required:true
    },
    password:{
       type: String,
        required:true
    },
    location:{
       type:Object,
        required:true
    },
    date:{
       type:Date,
        default:Date.now
    },
    description:{
        type:String,
    },
    social:{
        youtube:{
            type: String
        },
        twitter:{
            type: String
        },
        facebook:{
            type: String
        },
        instagram:{
            type: String
        }
    },
    payment_info:{
        card_number:{
            type:String
        },
        cvv:{
            type:Number,
        },
        expiry_date:{
            type:String
        },
        card_name:{
            type:String
        },
        paypal_info:{
            paypal_email:{
                type:String
            }
        }
    },
    prof_img:{
        type:String
    },
    auth_type:{
       type: mongoose.Schema.Types.ObjectID,
        ref:"Auth_Type"
    }
},{timestamp:true});

module.exports = User = mongoose.model("users", UserSchema);


