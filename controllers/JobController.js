
const Job = require('../models/JobsModel');
const User = require('../models/UserModel');

exports.createJob = async (req, res) => {
  try {
    const { title, description, location, salaryRange, jobType, applicationDeadline, company } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const newJob = new Job({
      title,
      description,
      location,
      salaryRange,
      jobType,
      applicationDeadline,
      company: company ? company : null, // Company is optional
      recruiter: userId,
    });

    // Save the job
    await newJob.save();

    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/jobController.js (add this)

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

    // Update allowed fields only (optional: sanitize updateData)
    // Here, allowing all passed fields to update for simplicity
    Object.assign(job, updateData);

    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/jobController.js (add this)

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
      // .populate('company', 'name location industry website')  // Populate company details
      .populate('recruiter', 'firstName lastName email');      // Populate recruiter details

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
    const recruiterId = req.user.userId;
    console.log(recruiterId);
    // if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
    //   return res.status(400).json({ success: false, message: 'Invalid recruiter ID' });
    // }
    const jobs = await Job.find({ recruiter: recruiterId });
    
    
    
    res.status(200).json({ message : "jobs for the recruiter are" , success: true, jobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('recruiter', 'firstName lastName')
      // .populate('company', 'name');

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





