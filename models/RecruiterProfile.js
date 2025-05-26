const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  phone: { type: String },
  company: { type: String },
  position: { type: String },
  location: { type: String },
  website: { type: String },
  companySize: { type: String },
  companyDescription: { type: String }, 
  verificationDocs: [{ type: String }] // array of Cloudinary/file URLs
}, { timestamps: true });

const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);

module.exports = RecruiterProfile;
