const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  salaryRange: {
    min: Number,
    max: Number,
  },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'] },
  postedDate: { type: Date, default: Date.now },
  applicationDeadline: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  company: { type:String},
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationCount : {type:Number , default : 0 , required:true}
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
