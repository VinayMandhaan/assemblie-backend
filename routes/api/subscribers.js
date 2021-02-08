const express = require('express')
const app = express()
const router = express.Router();
const Subscriber = require('../../models/Subscriber');
var mongoose = require('mongoose');


router.get('/:id',async(req,res)=>{
    try{
    const subscribers = await Subscriber.find({user_id:{$eq:req.params.id}})
    if(!subscribers){
      return res.json('No Subscribers Found')
    }
    return res.json(subscribers)
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})

router.post('/create', async(req,res)=>{
    const {userId, subscriberId} = req.body
    
    try{
        if(mongoose.Types.ObjectId.isValid(userId)) {
            const subs = await Subscriber.findOne({user_id:{$eq:userId}})
            // console.log(subs)
            if(subs){
                await Subscriber.findOneAndUpdate({user_id:{$eq:userId}},{ $push: {subscribers:subscriberId}})
                return res.json(subs)
            }
            // console.log('else',userId)
            const newSub = new Subscriber({
                user_id:userId,
                subscribers:subscriberId
            })
            
            const newSubscribers = await newSub.save()
            return res.json(newSubscribers)
        }
    }catch(err){
        console.log(err)
    }
})

router.post('/unsubscribe', async(req,res)=>{
    const {userId, subscriberId} = req.body
    // console.log(subscriberId)
    try{
        if(mongoose.Types.ObjectId.isValid(userId)) {
            const subs = await Subscriber.findOne({user_id:{$eq:userId}})
            // console.log(subs)
            if(subs){
                await Subscriber.findOneAndUpdate({user_id:{$eq:userId}},{ $pull: {subscribers:subscriberId}})
                return res.json(subs)
            }
        }
    }catch(err){
        console.log(err)
    }
})




module.exports = router
