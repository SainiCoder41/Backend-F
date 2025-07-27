const Contest = require("../models/contest");

const Create =async(req,res)=>{
  try {
    const { title, description, startTime, duration, difficulty, contestType, prizes } = req.body;
    // Basic validation
    if (!title || !description || !startTime || !duration || !difficulty || !contestType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Validate prdizes array
    if (prizes && !Array.isArray(prizes)) {
      return res.status(400).json({ message: "Prizes must be an array" });
    }
// console.log(req.result.id)
    const contest = await Contest.create({
      ...req.body,
      createdBy:req.result._id
      
      // If using authentication
    });
    res.status(201).json({
      message: "Contest created successfully",
      data: contest
    });
  } catch (err) {
    console.error("Error creating contest:", err);
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ message: "Contest with this title already exists" });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: "Server error creating contest" });
  }
};
const getContest = async(req,res)=>{
  try {
      const currentTime = new Date();
        const getAllContest = await Contest.find({
          // endTime:{$gt:currentTime}
        });
        if(!getAllContest){
          res.send("Contest is not found")
        }
        res.send(getAllContest);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching contests' });
    }

}

module.exports = {Create,getContest};