const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");



router.get("/cities",(req,res)=>{
    mongoose.connection.db.collection('cities',function(err, cities) {
        if(err){
            return res.status(402).json({error : err});
        }
        if(req.query.country && req.query.name){
            cities.find({country:req.query.country,name:{$regex:req.query.name,$options:"i"}}).limit(5).toArray((err,cities)=>{
                if(err){
                    return res.status(402).json({error : err});
                }
                return res.json({
                    success:true,
                    cities:cities
                });
            });
        }
        else{
            return res.status(402).json({error : "No Country Given"});
        }


    });
});
router.get("/countries",(req,res)=>{
    mongoose.connection.db.collection('countries',function(err, countries) {
        if(err){
            return res.status(402).json({error : err});
        }
        countries.find({}).toArray((err,countries)=>{
            if(err){
                return res.status(402).json({error : err});
            }
            return res.json({
                success:true,
                countries:countries
            });
        });

    });
})


module.exports=router;
