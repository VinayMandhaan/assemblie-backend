const express = require('express')
const app = express()
const router = express.Router();
var request = require('request');
require('dotenv').config();

const PAYPAL_ID = process.env.PAYPAL_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET
var data={}
var access_token

//Generate Token
router.post('/token',async(req,res)=>{
    try{
        data = {
            'grant_type': 'client_credentials'
        }
    
        var options = {
            url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
            method: 'POST',
            form:data,
            auth: {
                user:PAYPAL_ID,
                pass:PAYPAL_SECRET
            }
        }
    function callback(error, response, body) {
        if(error){
            console.log('CALLBACK',error)
        }
        else{
            // console.log(JSON.parse(response.body['access_token']))
            data = JSON.parse(response.body)
            access_token = data.access_token
            return res.json(JSON.parse(response.body))
        }
    }

    request(options, callback);
    }catch(err){
        console.log('CATCHERROR',err)
    }
})


router.post('/payout', async(req,res)=>{
    const {val,email} = req.body
    // console.log(email)
    var adminValue = val * 20 / 100
    // console.log('Admin Value', adminValue)
    var assemblerValue = val - adminValue
    // console.log('Assembler Value', assemblerValue)
    try{
        // For Generating Token
        tokenData = {
            'grant_type': 'client_credentials'
        }

        //Request For Generating Token
        var tokenOptions = {
            url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
            method: 'POST',
            form:tokenData,
            auth: {
                user:PAYPAL_ID,
                pass:PAYPAL_SECRET
            }
        }
       
        //Callback to generate Payouts based on the token.
        function callback(error, response, body) {
            if(error){
                console.log('CALLBACK',error)
            }
            else{
                try{
                    data = JSON.parse(response.body)
                    access_token = data.access_token

                    //Payout Headers
                    payOutHeaders={
                        'Content-Type': 'application/json',
                        'Authorization' : `Bearer ${access_token}`
                    }

                    //Payout Body
                    var dataString = `{ "sender_batch_header": { "sender_batch_id": "${Math.floor(1000000000 + Math.random() * 900000000)}", "recipient_type": "EMAIL", "email_subject": "You have money!", "email_message": "You received a payment. Thanks for using our service!" }, "items": [ { "amount": { "value": ${assemblerValue}, "currency": "GBP" }, "sender_item_id": "2", "recipient_wallet": "PAYPAL", "receiver": "${email}" }] }`;
                    
                    var payoutOptions = {
                        url: 'https://api.sandbox.paypal.com/v1/payments/payouts',
                        method: 'POST',
                        headers: payOutHeaders,
                        body:dataString
                    }
                    
                    //Callback for Payout
                    function payoutCallback(error, response, body) {
                        if(error){
                            console.log('CALLBACK',error)
                        }
                        else{
                            return res.json(JSON.parse(response.body))
                        }
                    }
                    // Request To Generate Payouts
                    request(payoutOptions, payoutCallback);
                
                }catch(err){
                    console.log(err)
                }
            }
        }
    
        //Request To Generate Token
        request(tokenOptions, callback);

        }catch(err){
            console.log('CATCHERROR',err)
        }
})


module.exports = router
