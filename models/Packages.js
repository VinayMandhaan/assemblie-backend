const mongoose = require('mongoose')

const PackagesSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectID,
         ref:"users"
     },
    package_name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    months:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    packageType:{
        type:[String],
        required:true
    },
    color:{
        type:String,
        required:true
    }
})

module.exports = Packages = mongoose.model('packages', PackagesSchema)