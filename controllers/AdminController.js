const User = require('../models/UserModel');
const Job = require('../models/JobsModel');

// Get all recruiters

const RecruiterProfile = require('../models/RecruiterProfile');

exports.getPendingRecruiters = async (req, res) => {
  try {
    // Find recruiters who are not verified yet
    const pendingRecruiters = await User.find({ 
      role: 'recruiter', 
      verificationStatus: 'pending'
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean(); // Get plain JS objects for easier merging

    // For each recruiter, fetch their profile
    const recruitersWithProfile = await Promise.all(
      pendingRecruiters.map(async (recruiter) => {
        const profile = await RecruiterProfile.findOne({ user: recruiter._id }).lean();
        return {
          ...recruiter,
          profile: profile || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: recruitersWithProfile.length,
      recruiters: recruitersWithProfile
    });
  } catch (error) {
    console.error('Error fetching pending recruiters:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching pending recruiters' 
    });
  }
};


// Verify a recruiter
exports.updateRecruiterVerification = async (req, res) => {
  try {
    const recruiterId = req.params.id;
    const { action } = req.body; // 'verify' or 'reject'

    const recruiter = await User.findById(recruiterId);

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    recruiter.verificationStatus = action === 'verify' ? 'verified' : 'rejected';
    await recruiter.save();

    res.status(200).json({
      message: `Recruiter has been ${action === 'verify' ? 'verified' : 'rejected'}.`,
      recruiter
    });
  } catch (error) {
    console.error('Error updating recruiter verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}, 'role verificationStatus firstName lastName email'); // only select the fields you need

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};


