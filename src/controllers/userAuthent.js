const redisclient = require("../config/redis");
const User = require("../models/user");
require('dotenv').config();
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const submission = require("../models/submission");
const register = async (req,res)=>{
    
    try{
        // validate the data;
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
          role:user.role,
          premium:user.premium,
        _id: user._id,
      
    }
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 60 * 60 * 1000 // 1 hour
});

     res.status(201).json({
        user:reply,
        message:"Loggin Successfully"
    })
    }
    catch(err){
        res.status(400).send("Error "+err);
    }
}

const login = async (req,res)=>{
    try{
        const {emailId,password}= req.body;
        if(!emailId)
            throw new Error("Invalid Credentails");
        if(!password)
            throw new Error("Invalid Credentails");

        const user = await User.findOne({emailId});
        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentails");

        const reply = {
          firstName:user.firstName,
          emailId:user.emailId,
            role:user.role,
            premium:user.premium,
            _id:user._id,
        
        }

            const token = jwt.sign({ _id: user._id, emailId:emailId,role:user.role }, process.env.JWT_KEY, {
      expiresIn: 3600,
    });
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 60 * 60 * 1000 // 1 hour
});


    res.status(201).json({
      user:reply,
      message:"Loggin Succesfully"
    });

    }catch(err){
        res.status(401).send("Error : "+err);
    }
}
const logout = async (req,res)=>{
  try{
    // Validate the token
    const {token} = req.cookies;
    const payload = jwt.decode(token);
    await redisclient.set(`token:${token}`,'Blocked');
    await redisclient.expireAt(`token:${token}`,payload.exp);
    // Token add kr duga reddis me 

    // Cookkies ko clear kar dena....
    res.cookie("token",null,{expires :new Date(Date.now())});
    res.send("Loggeg out Successfully");


  }catch(err){
    res.status(401).send("Error : "+err);
  }
}
const getProfile = async(req,res)=>{
  res.send("Get Profile");
}

const adminRegister = async(req,res)=>{
  try {
    // validate the data;
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "admin"

    const user = await User.create(req.body);
    //    JWT Token
    const token = jwt.sign({ _id: user._id, emailId:emailId,role:'admin' }, process.env.JWT_KEY, {
      expiresIn: 3600,
    });
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });


    res.status(201).send("Admin Register Succesfully");
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
}

const deleProfile = async(req,res)=>{
  try{
      const userId = req.result._id;
      await  User.findByIdAndDelete(userId);
        res.status(200).send("Deleted Successfully");
  }catch(err){
 res.status(500).send("Internal Server Error");
  }
}

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName problemSolved _id');
    // or using an object for projection:
    // const users = await User.find({}, { firstName: 1, lastName: 1, problemSolved: 1 });
    
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching users', error });
  }
};
module.exports = { register, login, logout , getProfile,adminRegister,deleProfile,getAllUser};