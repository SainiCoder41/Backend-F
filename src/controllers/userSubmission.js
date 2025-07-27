const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;
    
    if (!userId || !code || !problemId || !language) {
      return res.status(400).send("Some field missing");
    }

    const problem = await Problem.findById(problemId);
    const languageId = getLanguageById(language);

    // Create submission record
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    // Prepare submissions for Judge0
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    
    // Add base64_encoded=true parameter here
    const testResult = await submitToken(resultToken, true); // Modified this line

    // Process results
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;
    let accepted = true;

    for (const test of testResult) {
      if (test.status_id === 3) { // Accepted
        testCasesPassed++;
        runtime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        accepted = false;
        if (test.status_id === 4) { // Wrong Answer
          status = "wrong";
          errorMessage = test.stderr ? Buffer.from(test.stderr, 'base64').toString() : null;
        } else if (test.status_id === 5) { // Time Limit Exceeded
          status = "timeout";
          errorMessage = "Time Limit Exceeded";
        } else if (test.status_id === 6) { // Compilation Error
          status = "error";
          errorMessage = test.compile_output ? Buffer.from(test.compile_output, 'base64').toString() : null;
        } else { // Other errors
          status = "error";
          errorMessage = test.message || "Unknown error occurred";
        }
      }
    }

    // Update submission record
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    await submittedResult.save();

    // Update user's solved problems if accepted
    if (accepted && !req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    // Send response
    res.status(201).json({
      success: accepted,
      message: accepted ? "All test cases passed!" : "Some test cases failed",
      testCases: testResult.map(test => ({
        ...test,
        stdout: test.stdout ? Buffer.from(test.stdout, 'base64').toString() : null,
        stderr: test.stderr ? Buffer.from(test.stderr, 'base64').toString() : null,
        compile_output: test.compile_output ? Buffer.from(test.compile_output, 'base64').toString() : null
      })),
      totalTestCases: problem.hiddenTestCases.length,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      status
    });

  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};
const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
  
    const { code, language } = req.body;
    
    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");
    

    const problem = await Problem.findById(problemId);

    const languageId = getLanguageById(language);


    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));
    


    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);
    

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = false;
          errorMessage = test.stderr;
        } else {
          status = false;
          errorMessage = test.stderr;
        }
      }
    }


    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

module.exports = { submitCode, runCode };
