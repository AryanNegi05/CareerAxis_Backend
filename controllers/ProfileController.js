const JobSeekerProfile = require('../models/JobSeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const User = require('../models/UserModel');
const Applications = require('../models/ApplicationsModel')

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
    console.log("profile dhundhne do")
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

// In your ProfileController.js
exports.getJobSeekerProfileById = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("iski id se profile hai " , userId);

    const profile = await JobSeekerProfile.findOne({ user: userId })
      .populate({
        path: 'user',
        select: 'firstName lastName email role company',
      });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching job seeker profile by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// =======================
// Recruiter Profile
// =======================
exports.createOrUpdateRecruiterProfile = async (req, res) => {
  try {
    console.log("change krne ki baatcheet");
    console.log(req.body);
    const userId = req.user.userId;
    const { 
      phone,
      company, 
      position,
      location,
      website,
      companySize,
      companyDescription
    } = req.body;
    const file = req.file; // multer file (verificationDoc from frontend)

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = await RecruiterProfile.findOne({ user: userId });

    const currentCompany = profile?.company?.trim() || '';
    const newCompany = company?.trim() || '';
    const isCompanyInitiallyEmpty = currentCompany === '';
    const companyChanged = newCompany && newCompany !== currentCompany;

    // Prevent company change if unresolved job applications exist
    if (profile && companyChanged) {
      const pendingApps = await Applications.find({
        recruiter: userId,
        status: { $nin: ['accepted', 'rejected'] }
      });

      if (pendingApps.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You must resolve all your job applications before changing the company.'
        });
      }
    }

    // Document upload validations
    if (profile) {
      // Require docs if company added for first time or changed
      if (isCompanyInitiallyEmpty && newCompany && !file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload company verification documents when adding a company for the first time.'
        });
      }
      if (!isCompanyInitiallyEmpty && companyChanged && !file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload company verification documents when changing the company.'
        });
      }

      // Allow reupload if verification was rejected, even if company didn't change
      const allowReuploadIfRejected = !companyChanged && file && user.verificationStatus === 'rejected';
      if (allowReuploadIfRejected) {
        // Add new document to array (matching model field name)
        profile.verificationDocs = [file.path];
        user.verificationStatus = 'pending'; // reverify
      }

      // Update profile fields (matching frontend field names)
      profile.phone = phone || profile.phone;
      profile.company = newCompany || profile.company;
      profile.position = position || profile.position;
      profile.location = location || profile.location;
      profile.website = website || profile.website;
      profile.companySize = companySize || profile.companySize;
      profile.companyDescription = companyDescription || profile.companyDescription;

      if (companyChanged && file) {
        // Add new document to array
        profile.verificationDocs = [file.path];
        user.verificationStatus = 'pending'; // reset on change
      }

      await profile.save();
      await user.save(); // save verificationStatus if modified

    } else {
      // No profile exists
      if (newCompany && !file) {
        return res.status(400).json({
          success: false,
          message: 'Company verification documents are required when adding company.'
        });
      }

      profile = new RecruiterProfile({
        user: userId,
        phone,
        company: newCompany || undefined,
        position,
        location,
        website,
        companySize,
        companyDescription,
        verificationDocs: file ? [file.path] : [], // Array format matching model
      });

      if (newCompany) {
        user.verificationStatus = 'pending'; // trigger verification
        await user.save();
      }

      await profile.save();
    }

    return res.status(200).json({
      success: true,
      profile,
      message: 'Profile updated successfully',
      verificationStatus: user.verificationStatus
    });

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

