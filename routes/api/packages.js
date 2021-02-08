const express = require('express')
const app = express()
const router = express.Router();
const Packages = require('../../models/Packages');



router.get('/:id',async(req,res)=>{
    try{
    const package = await Packages.find({user_id:{$eq:req.params.id}})
    if(!package){
      return res.json('No Packages Found')
    }
    return res.json(package)
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server Error")
    }
  })


router.post('/create', async(req,res)=>{
    try{
    const{userId,package_name,price,months,package_type,description,color} = req.body
    console.log(package_type)
    const newPackage = new Packages({
        user_id:userId,
        package_name:package_name,
        price:price,
        months:months,
        packageType:package_type,
        description:description,
        color:color
    })
    const package = await newPackage.save()
    return res.json(package)
}catch(err){
    console.log(err.message)
    res.status(500).send("Server Error")
}
})


module.exports = router
