const express = require('express')
const app = express()
const router = express.Router();
const io = require('socket.io')();
const Chat = require('../../models/Chat');
const Room = require('../../models/Room');


//Init Middleware
app.use(express.json({extended:false}))


router.get('/',(req,res)=> res.send('API running'))

router.get('/room/:id',async(req,res)=>{
    try{
        const chatList = await Chat.find({room:{$eq:req.params.id}})
        if(!chatList){
            return res.json('No Chats Found')
        }

        return res.json({chats:chatList})
    }catch(err){
        console.log(err.message)
    }
})

router.post('/createroom',async(req,res)=>{
    try{
        const {room_id} = req.body
        // var room_id = Math.floor(100000 + Math.random() * 900000)
        const room = new Room({
            room_id:room_id
        })
        await room.save()
        return res.json(room_id)

    }catch(err){
        console.log(err.message)
    }
})

router.get('/room', async(req,res)=>{
    
    try{
        const {room_id} = req.body
        console.log(room_id)
        const room = await Room.findOne({room_id})
        if(!room){
            return res.json('Room not found')
        }
        res.json('Room Found with ID')

    }catch(err){
        console.log(err.message)
    }
})





module.exports=router;