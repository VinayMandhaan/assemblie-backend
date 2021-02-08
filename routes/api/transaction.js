const express = require('express')
const app = express()
const router = express.Router();
const Transaction = require('../../models/Transaction');
var mongoose = require('mongoose');


router.get('/user/:id',async(req,res)=>{
    try{
    const transactions = await Transaction.find({user_id:{$eq:req.params.id}})
    if(!transactions){
      return res.json('No Transactions Found')
    }
    return res.json(transactions)
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})

router.post('/create-transaction',async(req,res)=>{
    const{itemName,price,payee,userId} = req.body
    try{
        const newTransaction = new Transaction({
            user_id:userId,
            item_name:itemName,
            price:price,
            payee:payee
        })
        const transaction = await newTransaction.save()
        return res.json(transaction)
    }catch(err){
        console.log(err)
    }
})

router.get('/all',async(req,res)=>{
    try{
        const transactions = await Transaction.find()
        return res.json(transactions)
    }catch(err){
        console.log(err)
    }
})



module.exports = router

