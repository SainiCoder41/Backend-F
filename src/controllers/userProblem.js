const Problem = require("../models/problem");
const User = require("../models/user")
const Submission = require("../models/submission");
const SolutionVideo = require("../models/SolutionVideo")
const {getLanguageById ,submitBatch, submitToken} = require("../utils/problemUtility");
const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    problemCreator,
    referenceSolution,
    premium
  } = req.body;

  try{
    for(const{language ,completeCode} of referenceSolution){

        // source code
        // language id
        const languageId = getLanguageById(language);
        // stdin
        //expectedOutput
                // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
         const submitResult = await submitBatch(submissions);
         const resultToken  = submitResult.map((value)=>value.token);
         const testResult = await submitToken(resultToken);
     
         for(const test  of testResult){
          if(test.status_id !=3){
            console.log(test.status_id)
           return res.status(400).json({
  message: `Reference solution failed with status: ${test.status.description}`,
  error: test.compile_output || test.stderr
});

          }
         }
    }
    // We can store it in our db;
  const userProblem  = await Problem.create({
    ...req.body,
    problemCreator:req.result._id
  })
    res.status(201).send("Problem saved successfully");
  }catch(err){
    res.status(400).send("Error "+err.message);
  }
};

const updateProblem = async(req,res)=>{
  const {id} = req.params;
    const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, problemCreator
   } = req.body;
  try{
    if(!id){
      return res.status(400).send("ID is Missing");
    }
    const DsaProblem = await Problem.findById(id);
     if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }
    for (const { language, completeCode } of referenceSolution){

        // source code
        // language id
        const languageId = getLanguageById(language);
        // stdin
        //expectedOutput
                // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
         const submitResult = await submitBatch(submissions);
         const resultToken  = submitResult.map((value)=>value.token);
         const testResult = await submitToken(resultToken);
         for(const test  of testResult){
          if(test.status_id !=3){
            return res.status(400).send("Error Occured");
          }
         }
    }

    const newProblem  = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
    res.status(200).send(newProblem);



  }catch(err){
 res.status(500).send("Error: "+err);
  }
}


const deleteProblem = async(req,res)=>{

  const {id} = req.params;

  try{
    if(!id)
      return res.status(400).send("ID is Missing");
    
   const deletedProblem = await Problem.findByIdAndDelete(id);
    if(!deletedProblem)
    return res.status(404).send("Problem is Missing");
   res.status(200).send("Successfully Deleted");
  }catch(err){
  res.status(500).send("Error: "+err);
  }
}
 

const getProblemById = async(req,res)=>{
  const {id} = req.params;
  try{
     if(!id)
      return res.status(400).send("ID is Missing");
    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');;
       if(!getProblem)
        return res.status(404).send("Problem is Missing");

        const videos = await SolutionVideo.findOne({problemId:id});
   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);
  }catch(err){
  res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{

  try{
     
    const getProblem = await Problem.find({}).select('_id title difficulty tags premium description');

   if(getProblem.length==0)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}
const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;
// console.log(userId)
      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      // console.log(user)
      
      // console.log(user.problemSolved)
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
      
    
    const problemId = req.params.id;


    const ans = await Submission.find({ userId, problemId });
    
    if (ans.length === 0) {
      return res.status(200).json({ 
        message: "No submissions present",
        submissions: [] 
      });
      // ^^ Note the 'return' here
    }

    return res.status(200).json({
      message: "Submissions found",
      submissions: ans
    });

  } catch (err) {
    console.error("Error fetching submissions:", err);
    return res.status(500).json({ 
      error: "Internal Server Error",
      details: err.message 
    });
  }
}
module.exports = {createProblem , updateProblem , deleteProblem , getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};