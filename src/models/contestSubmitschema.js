const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSubmitSchema = new Schema({
    code: {
        type: String,
        required: true, // ✅ Correct spelling: "required", not "require"
    },
    language: {
        type: String,
        required: true,
    }
});

// ✅ Create and export the model
const ContestSubmit = mongoose.model('ContestSubmit', contestSubmitSchema);

module.exports = ContestSubmit;
