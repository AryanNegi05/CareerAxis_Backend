const express = require('express');
const router = express.Router();
const { auth, isJobSeeker, isRecruiter } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer')
const { 
  createOrUpdateJobSeekerProfile, 
  getJobSeekerProfile,
  createOrUpdateRecruiterProfile,
  getRecruiterProfile,
  getJobSeekerProfileById
} = require('../controllers/ProfileController');

// JobSeeker Profile Routes
router.post('/jobseeker/updateProfile', auth, isJobSeeker, upload.single('resume') ,createOrUpdateJobSeekerProfile); // Create/Update Profile
router.get('/jobseeker/MyProfile', auth, getJobSeekerProfile); // Get Profile

// Recruiter Profile Routes
router.post('/recruiter/updateProfile', auth, isRecruiter, upload.single('verificationDoc'), createOrUpdateRecruiterProfile);

router.get('/recruiter/MyProfile', auth, isRecruiter, getRecruiterProfile); // Get Profile

// In your routes file (e.g., profileRoutes.js)
router.get('/jobseeker/:userId', auth,   getJobSeekerProfileById);


module.exports = router;
