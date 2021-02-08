const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('dotenv').config()
const Streaming = require('../../models/Streaming');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public'));

const Mux = require('@mux/mux-node');
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);
let STREAM;


// Storage Configuration
const util = require('util');
const fs = require('fs');
const { find } = require('../../models/Streaming');
const stateFilePath = './.data/stream';
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Authentication Configuration
const webhookUser = {
  name: 'muxer',
  pass: 'muxology',
};

// Authentication Middleware
const auth = (req, res, next) => {
  function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
  };
  const user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
      return unauthorized(res);
  };
  if (user.name === webhookUser.name && user.pass === webhookUser.pass) {
      return next();
  } else {
      return unauthorized(res);
  };
};

// Creates a new Live Stream so we can get a Stream Key
const createLiveStream = async () => {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("It looks like you haven't set up your Mux token in the .env file yet.");
    return;
  }

  // Create a new Live Stream!
  return await Video.LiveStreams.create({
    playback_policy: 'public',
    reconnect_window: 10,
    new_asset_settings: { playback_policy: 'public' },
    test:true
  });
};

// Reads a state file looking for an existing Live Stream, if it can't find one, 
// creates a new one, saving the new live stream to our state file and global
// STREAM variable.
const initialize = async () => {
  try {
    const stateFile = await readFile(stateFilePath, 'utf8');
    STREAM = JSON.parse(stateFile);
    console.log('Found an existing stream! Fetching updated data.');
    STREAM = await Video.LiveStreams.get(STREAM.id);
  } catch (err) {
    console.log('No stream found, creating a new one.');
    // STREAM = await createLiveStream();
    // await writeFile(stateFilePath, JSON.stringify(STREAM));
  }
  return STREAM;
}

// Lazy way to find a public playback ID (Just returns the first...)
const getPlaybackId = stream => stream['playback_ids'][0].id;

// Gets a trimmed public stream details from a stream for use on the client side
const publicStreamDetails = stream => ({
  status: stream.status,
  playbackId: getPlaybackId(stream),
  recentAssets: stream['recent_asset_ids'],
  stream_key:stream.stream_key
})

// API for getting the current live stream and its state for bootstrapping the app
app.get('/stream', async (req, res) => {
  const stream = await Video.LiveStreams.get(STREAM.id);
  return res.json(
    publicStreamDetails(stream)
  );
});

//FIND ALL STREAMS
app.get('/allstreams', async(req,res)=> {
  const streams = await Streaming.find()
  if(!streams){
    return res.json('No Streams Found')
  }
  return res.json(streams)
})

//FIND STREAMS BY CATEORIES
app.post('/streamcategories', async(req,res)=>{
  const {categories} = req.body
  console.log(categories)
  try{
    const subData = await Streaming.find({"categories" : {"$in" : categories}})
    return res.json(subData)
  }catch(err){
    console.log(err)
  }
})


//GET STREAM BY USERID
app.get('/stream/:id', async(req,res)=>{
  try{
    const streams = await Streaming.find({user_id:{$eq:req.params.id}})
    if(!streams){
      return res.json('No Stream Found')
    }
    return res.json(streams)
    }catch(err){
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})


// API which Returns the 5 most recent VOD assets made from our Live Stream
// app.get('/recent', async (req, res) => {
//   const recentAssetIds = STREAM['recent_asset_ids'] || [];

//   // For each VOD asset we know about, get the details from Mux Video
//   const assets = await Promise.all(
//     recentAssetIds
//     .reverse()
//     .slice(0, 5)
//     .map((assetId) =>
//       Video.Assets.get(assetId).then(asset => {

//         return {
//           playbackId: getPlaybackId(asset),
//           status: asset.status,
//           createdAt: asset.created_at,
//         };
//       })
//     )
//   );
//   res.json(assets);
// });

// API for getting the current live stream and its state for bootstrapping the app
//Create Live Stream
app.post('/recent', async (req, res) => {
  
  STREAM = await createLiveStream();
  const stream = await Video.LiveStreams.get(STREAM.id);
  
  const {title,description,categories,user_id,paid} = req.body
  const streams = new Streaming({
    title:title,
    description:description,
    categories:categories,
    paid:paid,
    stream_key:stream.stream_key,
    playbackId:stream['playback_ids'][0].id,
    status:stream.status,
    user_id:user_id
  })
  await streams.save()
  return res.json(streams)
});


//TESTING PAID LIVE STREAM
app.post('/demo',async(req,res)=>{
  STREAM = await createLiveStream()
  const stream = await Video.LiveStreams.get(STREAM.id)
  return res.json(stream)
})

app.get('/getstreamkey/:id',async(req,res)=>{
  const streams = await Streaming.findOne({user_id:{$eq:req.params.id}}).sort({date:-1})
  if(!streams){
    return res.json('No Streams Found')
  }
  return res.json(streams)
})


//UPDATE STREAM
app.post('/stream/update',async(req,res)=>{
  const {streamId, title, description, categories, paid} = req.body
  const streamFields = {}
  console.log(paid)
  if(title) streamFields.title = title
  if(description) streamFields.description = description
  if(categories) streamFields.categories = categories
  if(paid) streamFields.paid = paid
  try{
    let streams = await Streaming.findById(streamId)
    if(streams){
      streams = await Streaming.findOneAndUpdate({_id:{$eq:streamId}},{ $set: streamFields},{new:true})
      return res.json(streams)
    }
    streams = new Streaming(streamFields);
    await streams.save()
    res.json(streams)
  }catch(err){
    console.log(err)
  }
})


// // GET KEYYYY
// app.get('/stream-key', async (req, res) => {
//   const stream = await Video.LiveStreams.get(STREAM.stream_key);
//   return res.json(
//     stream
//   );
// });

// API which Listens for callbacks from Mux
app.post('/mux-hook', auth, function (req, res) {
  STREAM.status = req.body.data.status;
  
  switch (req.body.type) {

      
    // When a stream goes idle, we want to capture the automatically created 
    // asset IDs, so we can let people watch the on-demand copies of our live streams
    case 'video.live_stream.idle':
      STREAM['recent_asset_ids'] = req.body.data['recent_asset_ids'];
      // We deliberately don't break; here

    // When a Live Stream is active or idle, we want to push a new event down our
    // web socket connection to our frontend, so that it update and display or hide
    // the live stream.
    case 'video.live_stream.active':
      io.emit('stream_update', publicStreamDetails(STREAM));
      break;
    default:
      // Relaxing.
  }

  res.status(200).send('Thanks, Mux!');
});

// Starts the HTTP listener for our application.
// Note: glitch helpfully remaps HTTP 80 and 443 to process.env.PORT
// initialize().then((stream) => {
//   const listener = http.listen(process.env.PORT || 4000, function() {
//     console.log('Your app is listening on port ' + listener.address().port);
//     console.log('HERE ARE YOUR STREAM DETAILS, KEEP THEM SECRET!');
//     // console.log(`Stream Key: ${stream.stream_key}`);
//   });
// });

module.exports=app;