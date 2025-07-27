const express = require('express');
const contestRouthe = express.Router();
const {Create,getContest} = require("../routes/contestCreator");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
// const userMiddleware = require('../middleware/userMiddleware');

contestRouthe.post("/create",adminMiddleware,Create);
contestRouthe.get("/getContest",userMiddleware,getContest);


module.exports = contestRouthe;