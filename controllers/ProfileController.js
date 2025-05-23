const JobSeekerProfile = require('../models/JobSeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const User = require('../models/UserModel');

// =======================
// Job Seeker Profile
// =======================

// Create or Update Job Seeker Profile
// controllers/profileController.js

exports.createOrUpdateJobSeekerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      phone,
      location,
      bio
      // DO NOT destructure skills, experience, education here if parsing them below
    } = req.body;

    const resumeUrl = req.file?.path;

    const profileData = {
      user: userId,
      ...(resumeUrl && { resume: resumeUrl }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(bio && { bio }),
      ...(req.body.skills && { skills: JSON.parse(req.body.skills) }),
      ...(req.body.experience && { experience: JSON.parse(req.body.experience) }),
      ...(req.body.education && { education: JSON.parse(req.body.education) })
    };

    const profile = await JobSeekerProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Profile saved', profile });

  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};


exports.getJobSeekerProfile = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({ user: req.user.userId })
      .populate({
        path: 'user',
        select: 'firstName lastName email role company',
      });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// =======================
// Recruiter Profile
// =======================

// Create or Update Recruiter Profile
exports.createOrUpdateRecruiterProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bio, linkedin, company } = req.body;

    let profile = await RecruiterProfile.findOne({ user: userId });

    if (profile) {
      // Update
      profile.bio = bio || profile.bio;
      profile.linkedin = linkedin || profile.linkedin;
      profile.company = company || profile.company;

      await profile.save();
      return res.status(200).json({ success: true, profile });
    }

    // Create
    profile = new RecruiterProfile({
      user: userId,
      bio,
      linkedin,
      company,
    });

    await profile.save();
    return res.status(201).json({ success: true, profile });

  } catch (error) {
    console.error('Error in createOrUpdateRecruiterProfile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Recruiter Profile
exports.getRecruiterProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await RecruiterProfile.findOne({ user: userId })
      .populate('user', ['firstName', 'lastName', 'email', 'role'])
      // .populate('company');  // Populate company info if you want

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

