const mongoose = require('mongoose');
const { Schema } = mongoose;

const prizeSchema = new Schema({
  rank: {
    type: String, // Can be number or range like "4-50"
    required: true
  },
  amount: {
    type: String,
    required: true
  }
});

const contestSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  description: {  // Fixed typo from 'descrition'
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {  // Added for better querying
    type: Date
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  prizePool:{
    type:Number,
    require:true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Easy-Medium', 'Medium', 'Medium-Hard', 'Hard'],
    required: true
  },
  contestType: {
    type: String,
    enum: ['Weekly', 'Biweekly', 'Monthly', 'Special'],
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], // Added Cancelled
    default: 'Upcoming'
  },
  prizes: [prizeSchema], // Better structure than separate arrays
  participants: {  // Track registered users
    type: Number,
    default: 0
  },
  premiumOnly: {  // Added premium flag
    type: Boolean,
    default: false
  },
  createdBy: {  // Track contest creator
    type:String ,
    ref: 'admin'
  }
}, { timestamps: true });




// Indexes for better performance
contestSchema.index({ startTime: 1, status: 1 });
contestSchema.index({ contestType: 1, status: 1 });

const contest = mongoose.model('contest', contestSchema);
module.exports = contest;