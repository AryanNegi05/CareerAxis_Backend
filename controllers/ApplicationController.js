const Application = require('../models/ApplicationsModel');
const Job = require('../models/JobsModel');

exports.applyForJob = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { resume, coverLetter } = req.body;
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if job is open
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is closed for applications' });
    }

    // Check if application deadline has passed
    const now = new Date();
    if (job.applicationDeadline && job.applicationDeadline < now) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if user already applied
    const alreadyApplied = await Application.findOne({ jobId: jobId, applicant: userId });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      jobId: jobId,
      applicant: userId,
      resume,
      coverLetter,
      status: 'applied', // default status on apply
      recruiter : job.recruiter,
      appliedAt: now,
    });

    await application.save();
    job.applicationCount = (job.applicationCount || 0) + 1;
    await job.save();
    return res.status(201).json({ message: 'Application submitted successfully', application });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.withdrawApplication = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appId = req.params.appId;


    // Find application by id and ensure it belongs to user
    const application = await Application.findOne({ _id: appId, applicant: userId });
    if (!application) return res.status(404).json({ message: 'Application not found or unauthorized' });

    // Optionally, check if application status allows withdrawal (e.g. only pending)
    if (application.status !== 'applied') {
      return res.status(400).json({ message: 'Cannot withdraw application at this stage' });
    }

    await application.deleteOne();
    const jobId = application.jobId;                       // assumes Application has a `job` field
    await Job.findByIdAndUpdate(
      jobId,
      { $inc: { applicationCount: -1 } },
      { new: false }
    );
    
    res.status(200).json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptApplication = async (req, res) => {
  try {
    const appId = req.params.appId;

    // Find application
    const application = await Application.findById(appId).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    // Only recruiter who owns the job can accept
    if (application.jobId.recruiter.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'accepted';
    await application.save();
    res.status(200).json({ message: 'Application accepted', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const appId = req.params.appId;

    // Find application
    const application = await Application.findById(appId).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Only recruiter who owns the job can reject
    if (application.jobId.recruiter.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'rejected';
    await application.save();

    res.status(200).json({ message: 'Application rejected', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listApplications = async (req, res) => {
  try {
    console.log("call lagi")
    const jobId = req.params.jobId;

    // Verify job exists and recruiter owns the job
    const job = await Job.findById(jobId);
    console.log(job);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const applications = await Application.find({ jobId: jobId })
      .populate('applicant', 'firstName lastName email ') // applicant info
      .sort({ appliedAt: -1 });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppliedApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch applications applied by the user
    const applications = await Application.find({ applicant: userId })
      .populate('jobId', 'title location jobType company') // Populate job details
      .sort({ appliedDate: -1 });

    return res.status(200).json({
      success: true,
      applications,
    });

  } catch (error) {
    console.error('Error fetching applied applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching applied applications',
    });
  }
};

exports.getAllRecruiterApplications = async (req, res) => {
  try {
    console.log("ye call lagri hai?")
    const userId = req.user.userId;
    console.log("all application pending", userId);

    const pendingApps = await Application.find({
      recruiter: userId,
      status: { $nin: ['accepted', 'rejected'] }
    });
    console.log(pendingApps);
    return res.status(200).json({
      success: true,
      pendingApps
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Applications not found"
    });
  }
};

