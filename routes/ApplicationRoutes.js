const express = require('express');
const router = express.Router();
const { auth, isRecruiter, isJobSeeker, isVerifiedRecruiter } = require('../middlewares/authMiddleware');
const {
  applyForJob,
  withdrawApplication,
  acceptApplication,
  rejectApplication,
  listApplications,
  getAppliedApplications,
} = require('../controllers/ApplicationController');

// Jobseeker only
router.get('/applied', auth, isJobSeeker, getAppliedApplications);
router.post('/apply/:jobId', auth, isJobSeeker, applyForJob); 
router.delete('/withdraw/:appId', auth, isJobSeeker, withdrawApplication);

// Recruiter only (Verified Recruiters only)
router.put('/accept/:appId', auth, isRecruiter, isVerifiedRecruiter, acceptApplication);
router.put('/reject/:appId', auth, isRecruiter, isVerifiedRecruiter, rejectApplication);
router.get('/applications/:jobId', auth, isRecruiter, isVerifiedRecruiter, listApplications);

module.exports = router
