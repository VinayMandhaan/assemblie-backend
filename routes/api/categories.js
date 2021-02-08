const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const validateToken = require('../../validation/validateToken');


router.get("/",(req,res)=>{
    mongoose.connection.db.collection('categories',function(err, collection) {
        if(err){
            return res.status(402).json({error : err});
        }
        // console.log(collection);
        collection.find({}).toArray((err,categories)=>{
            if(err){
                return res.status(402).json({error : err});
            }
            return res.json({
                success:true,
                categories:categories
            });
        });

    });

});
module.exports=router;
