const express = require('express')
const app = express()
const router = express.Router();
const Subscription = require('../../models/Subscription');
var mongoose = require('mongoose');


router.get('/:id',async(req,res)=>{
    try{
    const subscription = await Subscription.find({user_id:{$eq:req.params.id}})
    if(!subscription){
      return res.json('No Subscriptions Found')
    }
    return res.json(subscription)
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})


router.post('/create', async(req,res)=>{
    const {userId, subscriptionId} = req.body
    
    try{
        if(mongoose.Types.ObjectId.isValid(userId)) {
            const subs = await Subscription.findOne({user_id:{$eq:userId}})
            // console.log(subs)
            if(subs){
                await Subscription.findOneAndUpdate({user_id:{$eq:userId}},{ $push: {subscriptions:subscriptionId}})
                return res.json(subs)
            }
            // console.log('else',userId)
            const newSub = new Subscription({
                user_id:userId,
                subscriptions:subscriptionId
            })
            
            const newSubscriptions = await newSub.save()
            return res.json(newSubscriptions)
        }
    }catch(err){
        console.log(err)
    }
})


router.post('/remove', async(req,res)=>{
    const {userId, subscriptionId} = req.body
    // console.log(subscriptionId)
    try{
        if(mongoose.Types.ObjectId.isValid(userId)) {
            const subs = await Subscription.findOne({user_id:{$eq:userId}})
            if(subs){
                await Subscription.findOneAndUpdate({user_id:{$eq:userId}},{ $pull: {subscriptions:subscriptionId}})
                return res.json(subs)
            }
        }
    }catch(err){
        console.log(err)
    }
})

module.exports = router