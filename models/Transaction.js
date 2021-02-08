const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"users"
     },
    item_name:{
         type:String
    },
    price:{
        type:String
    },
    payee:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = Transaction = mongoose.model("transactions", TransactionSchema);


