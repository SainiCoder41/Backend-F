const express = require('express');
const authRouther = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {register, login, logout , getProfile , adminRegister,deleProfile, getAllUser} = require("../controllers/userAuthent");

// Register
authRouther.post("/register",register);
// login
authRouther.post("/login",login);
// logout
authRouther.post("/logout",userMiddleware,logout);
// getprofile
authRouther.post("/getProfile",getProfile);
authRouther.post("/admin/register",adminMiddleware,adminRegister);
authRouther.delete("/deleteProfile",userMiddleware,deleProfile);
authRouther.get('/check', userMiddleware, (req, res) => {
   const reply = {
        firstName: req?.result?.firstName,
        emailId: req?.result?.emailId,
        _id:req?.result?._id,
        premium:req?.result?.premium,
        role:req.result?.role
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
});
authRouther.get("/getAllUser",getAllUser)

module.exports = authRouther;