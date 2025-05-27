const Job = require('../models/JobsModel');
const User = require('../models/UserModel');
const Company = require('../models/CompanyModel');
const RecruiterProfile = require('../models/RecruiterProfile');

exports.createJob = async (req, res) => {
  try {
    const { title, description, location, salaryRange, jobType, applicationDeadline } = req.body;
    const userId = req.user.userId;

    // Validate user exists and is a verified recruiter
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = await RecruiterProfile.findOne({ user: userId });
    console.log(profile);

    // Validate company exists if provided

    const newJob = new Job({
      title,
      description,
      location,
      salaryRange,
      jobType,
      applicationDeadline,
      company: profile.company,
      recruiter: userId,
      applicationCount : 0
    });

    await newJob.save();

    // Populate company and recruiter info for response
    // await newJob.populate('company', 'name location');
    await newJob.populate('recruiter', 'firstName lastName email');

    res.status(201).json({ 
      message: "Job posted successfully", 
      job: newJob 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;
    const updateData = req.body;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user is the recruiter who posted this job
    if (job.recruiter.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this job' });
    }

    // Update the job
    Object.assign(job, updateData);
    await job.save();

    // Populate for response
    await job.populate('company', 'name location');
    await job.populate('recruiter', 'firstName lastName email');

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user is the recruiter who posted this job
    if (job.recruiter.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('company', 'name location industry website')
      .populate('recruiter', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getJobsByRecruiter = async (req, res) => {
  try {
    console.log("idhar to aagye ji")
    const recruiterId = req.user.userId;
    
    const jobs = await Job.find({ recruiter: recruiterId })
      .populate('company', 'name location')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: "Jobs for the recruiter", 
      success: true, 
      jobs 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('recruiter', 'firstName lastName')
      .populate('company', 'name location industry')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};