const express = require('express');
const cors = require('cors');
const mongoose=require('mongoose');
const io = require('socket.io')();
const passport=require("passport");

require('dotenv').config();


const users= require('./routes/api/users');
const categories = require('./routes/api/categories');
const settings = require('./routes/api/settings');
const streaming = require('./routes/api/streaming')
const chat = require('./routes/api/chat')
const packages = require('./routes/api/packages')
const subscribers = require('./routes/api/subscribers')
const subscriptions = require('./routes/api/subscription')
const paypal = require('./routes/api/paypal')
const stripe = require('./routes/api/stripe')
const transaction = require('./routes/api/transaction')
const app = express();
const port=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri,{useNewUrlParser:true,useCreateIndex:true});
const connection= mongoose.connection;

connection.once('open',()=>{
    console.log("MongoDB database connection established successfully!");
})
// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.use("/api/categories",categories);
app.use("/api/settings",settings);
app.use("/api/streaming",streaming);
app.use("/api/chat",chat);
app.use("/api/packages",packages);
app.use("/api/subscribers",subscribers);
app.use("/api/subscription",subscriptions);
app.use("/api/paypal",paypal);
app.use("/api/stripe",stripe);
app.use("/api/transaction",transaction);
const expressServer = app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

io.on('connection', socket => {
    const date = Date.now()
    console.log('CONNECTED')
    socket.on('message',async({name,message,roomId}) => {
        console.log(roomId)
        const chat = new Chat({
            name:name,
            message:message,
            room:roomId,
            date:date
        })
        io.emit(roomId,({name,message,date}))
        await chat.save()
        const chats = await Chat.find()
        // io.emit('message',{chats:chats})
        console.log(name,message,chats)
    })
})


io.listen(expressServer)