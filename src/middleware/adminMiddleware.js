const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{

    try{

        const {token} = req.cookies;
          if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authorization token required" 
            });
        }

        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id,role} = payload;

          if (!_id) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token payload" 
            });
        }

       

         if (role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Admin privileges required" 
            });
        }

         const result = await User.findById(_id);
        if(!result){
             return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Redis ke blockList mein persent toh nahi hai

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;
    


        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = adminMiddleware;
