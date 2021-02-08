const jwt = require("jsonwebtoken");
//Format of the TOKEN
// bearer <token>

module.exports=function validateToken(req,res,next) {
    const bearerHeader = req.header['authorization'];
    if(typeof bearerHeader!=='undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken=bearer[1];
        req.token=bearerToken;
        next();
    }
    else{
        return res.status(403).json({forbidden:"forbidden"})
    }
};
