const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"users"
     },
     subscriptions:{
         type:[String]
    }
});

module.exports = Subscription = mongoose.model("subscriptions", SubscriptionSchema);


