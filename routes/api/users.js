const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verification_email=require('../../mails/verification')
const validateToken = require('../../validation/validateToken');
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");
const AuthType= require('../../models/Auth_Type');
const verification_code=require('../../models/verification_code');
const { route } = require("./streaming");
const mongoose = require("mongoose");
const AuthTypeUser= require('../../models/Auth_Type');

const AuthTypeUsers= async (user_id)=>{
   const answer = AuthTypeUser.findById(user_id).then(auth=>{
        if(auth){
            return auth.superAdmin ? 1 : (auth.assembler ? 2 : 3)
        }
        else{
            return false;
        }
    })

    return await answer;
}


const createAuthType=function(type){
  if(parseInt(type)===1){
    const Auth = new AuthType({
      superAdmin: true
    })
    return Auth.save();

  }
  else if(parseInt(type)===2){
    const Auth = new AuthType({
      assembler: true
    })
    return Auth.save();

  }
  else{
    const Auth = new AuthType({
      assemble: true
    })
    return Auth.save();
  }
}

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
// Check validation
//     return res.status(400).json(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "The email you entered already exists. Please! Try other email." });
    }
    else {
      User.findOne({username:req.body.username}).then(user=>{
        if(user){
          return res.status(400).json({ username: "The username you entered already exists. Please! Try other username." });
        }
        createAuthType(req.body.type).then(Auth=>{
          const newUser = new User({
            username:req.body.username,
            first_name: req.body.first_name,
            last_name:req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            location:req.body.location,
            auth_type:Auth._id.toString()
          });

// Hash password before saving in database
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                  .save()
                  .then(user => {
                    const newVerification=new verification_code({
                      code:Math.floor(100000 + Math.random() * 900000),
                      user_id:user._id.toString()
                    })
                    newVerification.save().then(verificationCode=>{
                      let data={
                        name:`${user.first_name} ${user.last_name}`,
                        verification_code:verificationCode.code,
                        mail:user.email
                      }
                      verification_email(data);
                      res.json({
                        verified:false,
                        success:true,
                        user_id:user._id.toString()
                      })
                    }).catch(err=>console.log(err));

                  })
                  .catch(err => console.log(err));
            });
          });
        }).catch(err=> console.log(err) )
      }).catch(err=> console.log(err));


    }
  });
});

router.post("/resendcode",(req,res)=>{
  if(req.body.user_id==undefined){
    return res.status(400).json({error:"Not Logged in"});
  }
  const user_id=req.body.user_id;
  Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }
  verification_code.findOne({user_id}).then(verificationCode=>{
    if(!verificationCode){
      return res.status(400).json({error:"Server Error"});
    }
    verificationCode.set('code',Math.floor(100000 + Math.random() * 900000),{strict:false});
    verificationCode.set('created_at',Date.now(),{strict:false});
    const expired_at=new Date().addHours(0.5);
    verificationCode.set('expire_at',expired_at,{strict:false});
    verificationCode.save();
    User.findOne({_id:user_id}).then(user=>{
      let data={
        name:`${user.first_name} ${user.last_name}`,
        verification_code:verificationCode.code,
        mail:user.email
      }
      verification_email(data);
      res.json({
        success:true
      });
    }).catch(err=>console.log(err));

  }).catch(err=>console.log(err))
});
// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/verification",(req,res)=>{
  if(req.body.user_id===undefined){
    return res.status(400).json({error:"Not Logged in"});
  }
  else if(req.body.code===undefined){
    return res.status(400).json({error:"Please enter code."});
  }
  const user_id=req.body.user_id;
  const code=req.body.code;
  console.log(user_id,code)
  verification_code.findOne({code}).then(verification=>{
    if(!verification){
      return res.status(400).json({error:"Invalid Code"});
    }
    const expire=new Date(verification.expire_at);
    if(Date.now() > expire){
      return res.status(400).json({error:"The Code has been expired. Please click on resend button to g et new code."});
    }
    if(verification.user_id.toString() !== user_id){
      return res.status(400).json({error:"Invalid Code"});
    }
    User.findById(user_id).then(user=>{
      if(!user){
        return res.status(400).json({error:"We couldn't find the user."});
      }
      AuthType.findById(user.auth_type).then(auth=>{
        verification_code.deleteOne({code},function (err) {
          if(err){
            return res.status(400).json({error:"Server Error"});
          }});
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          user_type: auth.superAdmin ? 1 : (auth.assembler ? 2 : 3)
        };
        jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              user.set('type',payload.user_type,{strict:false});
              user.set('password','',{strict:false});
              // userData.type=payload.user_type;
              res.json({
                verified: true,
                user:user,
                success: true,
                token: "Bearer " + token
              });
            }
        );
      }).catch(err=>console.log(err));
    }).catch(err=>console.log(err))

  }).catch(err=>console.log(err));

});
router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
// Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "The email you entered doesn't exist." });
    }
    AuthType.findById(user.auth_type).then(auth=>{
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          verification_code.findOne({user_id:user._id}).then(code=>{
            if(code){
              res.json({
                verified:false,
                success:true,
                user_id:user._id.toString()
              })
            }
            else{
              // User matched
              // Create JWT Payload
              const payload = {
                id: user.id,
                name: user.name,
                user_type: auth.superAdmin ? 1 : (auth.assembler ? 2 : 3)
              };
// Sign token
              jwt.sign(
                  payload,
                  keys.secretOrKey,
                  {
                    expiresIn: 31556926 // 1 year in seconds
                  },
                  (err, token) => {
                    user.set('type',payload.user_type,{strict:false});
                    user.set('password','',{strict:false});
                    // userData.type=payload.user_type;
                    res.json({
                      verified: true,
                      user:user,
                      success: true,
                      token: "Bearer " + token
                    });
                  }
              );
            }
          })

        } else {
          return res
              .status(400)
              .json({ passwordincorrect: "The Password you entered is incorrect." });
        }
      });
    }).catch(err=> console.log(err));

  });
});

router.get("/users",validateToken,(req,res)=>{
  jwt.verify(req.token,keys.secretOrKey,(err,authData)=>{
    if(err){
      return res.status(403).json({forbidden:"forbidden"})
    }
    else{
      const type=authData.user_type
      if(type===1){
        User.find({},function(err, users) {
          var userMap = {};

          users.forEach(function(user) {
            userMap[user._id] = user;
          });

          return res.json({success:true,users:userMap});
        }).catch(err=> console.log(err))
      }
      else{
        return res.status(403).json({forbidden:"forbidden"})
      }
    }
  })
})

router.post("/logout",(req,res)=>{
  const token = req.body.token;

});


router.post("/userId", async(req,res)=>{
  try{
    const {userId} = req.body
    console.log(userId)
    const details = await User.findById(userId)
    if(!details){
      return res.json('No Record Found')
    }
    return res.json({details})
  }catch(err){
    console.log(err)
  }
})


router.post('/updateUser', async(req,res)=>{
  const {userId,first_name,last_name,description,youtube,facebook,twitter,instagram, card_name, card_number, cvv, expiry_date, paypal_email} = req.body
  const profileFields = {}
  if(first_name) profileFields.first_name = first_name
  if(last_name) profileFields.last_name = last_name
  if(description) profileFields.description = description
  
  profileFields.social = {}
  if(youtube) profileFields.social.youtube = youtube
  if(facebook) profileFields.social.facebook = facebook
  if(twitter) profileFields.social.twitter = twitter
  if(instagram) profileFields.social.instagram = instagram

  profileFields.payment_info={}
  if(card_name) profileFields.payment_info.card_name = card_name
  if(card_number) profileFields.payment_info.card_number = card_number
  if(cvv) profileFields.payment_info.cvv = cvv
  if(expiry_date) profileFields.payment_info.expiry_date = expiry_date
  profileFields.payment_info.paypal_info={}
  if(paypal_email) profileFields.payment_info.paypal_info.paypal_email = paypal_email

  try{
    console.log(first_name)
    let userProfile =  await User.findById(userId)
    if(userProfile){
      console.log(userProfile)
      userProfile = await User.findOneAndUpdate({_id:{$eq:userId}},{ $set: profileFields},{new:true})
      var  authType = await AuthType.findById(userProfile.auth_type)
      console.log(authType);
      userProfile.set('type',authType.superAdmin ? 1 : (authType.assembler ? 2 : 3), {strict:false})
      return res.json(userProfile)
    }
    var  authType = await AuthType.findById(userProfile.auth_type)
    profileFields.type = authType.superAdmin ? 1 : (authType.assembler ? 2 : 3)
    userProfile = new User(profileFields);
    await userProfile.save()
    res.json(userProfile)
  }catch(err){
    console.log(err)
  }
})

router.post('/uploadImage', async(req,res)=>{
  const {imageUrl, userId} = req.body
  try{
    let profileImage = await User.findById(userId)
    if(!profileImage){
      return res.json('No Profile Found')
    }
      profileImage.prof_img = imageUrl
      var  authType = await AuthType.findById(profileImage.auth_type)
      profileImage.set('type',authType.superAdmin ? 1 : (authType.assembler ? 2 : 3), {strict:false})
      
      
      await profileImage.save()
      res.json(profileImage)
   
   
  }catch(err){
    console.log(err)
  }
})

router.post('/subscribersdata', async(req,res)=>{
  const {subs} = req.body
  console.log(subs)
  try{
    const subData = await User.find({"_id" : {"$in" : subs}})
    return res.json(subData)
  }catch(err){
    console.log(err)
  }
})


router.get("/assemblers",async(req,res)=>{
  try{
    mongoose.connection.db.collection('users',function(err, collection) {
      if(err){
          console.log(err)
      }
      // console.log(collection);
      collection.find({}).toArray(async (err,users) => {
          if(err){
              console.log(err);
          }
          else{
              let users_assemblers=[];
              for(const user of users){
                  user.password='';
                  user.name=user.first_name +" "+user.last_name;
                  user.country=user.location.country;
                  user.auth_type = await AuthTypeUsers(user.auth_type);
                  user.tags=[user.auth_type===2 ? 'Assembler': 'Assemble']

                  if(user.auth_type===2){
                      users_assemblers.push(user);
                  }
              }
              return res.json({
                  users:users_assemblers
              })
          }
      })
  })
  }catch(err){
    console.log(err)
  }
});


router.post('/create-payment',async(req,res)=>{
    const {card_name,card_number,cvv,expiry_date, userId, paypal_email} = req.body
    const profileFields={}
    profileFields.payment_info={}
    if(card_name) profileFields.payment_info.card_name = card_name
    if(card_number) profileFields.payment_info.card_number = card_number
    if(cvv) profileFields.payment_info.cvv = cvv
    if(expiry_date) profileFields.payment_info.expiry_date = expiry_date
    profileFields.payment_info.paypal_info={}
    if(paypal_email) profileFields.payment_info.paypal_info.paypal_email = paypal_email
    try{
      let userProfile =  await User.findById(userId)
      if(userProfile){
        userProfile = await User.findOneAndUpdate({_id:{$eq:userId}},{ $set: profileFields},{new:true})
        var  authType = await AuthType.findById(userProfile.auth_type)
        console.log(authType);
        userProfile.set('type',authType.superAdmin ? 1 : (authType.assembler ? 2 : 3), {strict:false})
        return res.json(userProfile)
      }
      var  authType = await AuthType.findById(userProfile.auth_type)
      profileFields.type = authType.superAdmin ? 1 : (authType.assembler ? 2 : 3)
      userProfile = new User(profileFields);
      await userProfile.save()
      res.json(userProfile)
    }catch(err){
      console.log(err)
    }
})


module.exports=router;
