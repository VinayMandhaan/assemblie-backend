const express = require('express')
const app = express()
const router = express.Router();
const stripe = require('stripe')("sk_test_51HJecfDK0ioqWXMOE2jbbb4w6IGOfMHjkIzHiBjTxp8nIBzCPXEIDSoPVkQbTv1ZWYHutTVAdejGLVUN1LxpoXAJ00Vh2urg3T")
var request = require('request');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');


router.post('/checkout',async(req,res)=>{
    const {price,itemName,token} = req.body
    try{
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
          });
    const idemptoency_key = uuidv4()
    const charge = await stripe.charges.create(
    {
        amount: price * 100,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased ${itemName} for ${price}`,
    })
    return res.json(charge)
}catch(err){
    console.log(err)
}

})


router.post('/checkout/mobile', async(req,res)=> {
    const {price,itemName,token, email} = req.body
    try{
        const customer = await stripe.customers.create({
            email:email,
            source:token
        })
        const charge = await stripe.charges.create({
            amount:price*100,
            currency: "usd",
            customer: customer.id,
            receipt_email: email,
            description: `Purchased ${itemName} for ${price}`,
        })
        return res.json(charge)
    }catch(err){
        console.log(err)
    }
})

module.exports = router