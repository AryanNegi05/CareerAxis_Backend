const express = require('express');
const router = express.Router();
const { auth, isJobSeeker, isRecruiter } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer')
const { 
  createOrUpdateJobSeekerProfile, 
  getJobSeekerProfile,
  createOrUpdateRecruiterProfile,
  getRecruiterProfile,
} = require('../controllers/ProfileController');

// JobSeeker Profile Routes
router.post('/jobseeker/updateProfile', auth, isJobSeeker, upload.single('resume') ,createOrUpdateJobSeekerProfile); // Create/Update Profile
router.get('/jobseeker/MyProfile', auth, isJobSeeker, getJobSeekerProfile); // Get Profile

// Recruiter Profile Routes
router.post('/recruiter/updateProfile', auth, isRecruiter, createOrUpdateRecruiterProfile); // Create/Update Profile
router.get('/recruiter/myProfile', auth, isRecruiter, getRecruiterProfile); // Get Profile

module.exports = router;
