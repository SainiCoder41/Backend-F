const express = require('express');
const contestSubmitRouter = express.Router();
// const contestSubmitSchema = require('../models/contestSubmitschema');
// const contestSubmitSchema = require('../models/contestSubmitschema');
const ContestSubmit = require("../models/contestSubmitschema");
const userMiddleware = require("../middleware/userMiddleware");


contestSubmitRouter.post("/submit", async (req, res) => {
    try {

        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({ message: "Code and language are required." });
        }

  await ContestSubmit.create({ code, language });
        res.status(200).send("Submitted Successfully");
    } catch (err) {
        console.error("Error while submitting:", err);
        res.status(400).send("Failed");
    }
});

module.exports = contestSubmitRouter;