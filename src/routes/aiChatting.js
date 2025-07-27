const express = require('express');
const solveDoubt = require('../controllers/solveDoubt');
const aiRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
aiRouter.post('/chat',userMiddleware,solveDoubt);
module.exports = aiRouter;