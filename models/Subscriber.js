const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"users"
     },
     subscribers:{
         type:[String]
    }
});

module.exports = Subscriber = mongoose.model("subscribers", SubscriberSchema);


