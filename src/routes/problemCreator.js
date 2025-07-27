const express = require('express');

const problemRouther = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require("../middleware/userMiddleware");

const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem} = require("../controllers/userProblem")



//create
problemRouther.post("/create",adminMiddleware,createProblem); // by admin
// fetch
problemRouther.get("/problemById/:id",userMiddleware,getProblemById);
problemRouther.get("/getAllProblem",userMiddleware,getAllProblem);
// //update
problemRouther.put("/update/:id",adminMiddleware,updateProblem); // by admin //

//delete
problemRouther.delete("/delete/:id",adminMiddleware,deleteProblem); // by admin //

problemRouther.get("/problemSolvedByUser",userMiddleware,solvedAllProblembyUser);
problemRouther.get("/submittedProblem/:id",userMiddleware,submittedProblem);

module.exports = problemRouther;