const express = require('express');
const router = express.Router();
const { auth, isRecruiter, isJobSeeker } = require('../middlewares/authMiddleware');
const {
  applyForJob,
  withdrawApplication,
  acceptApplication,
  rejectApplication,
  listApplications,
  getAppliedApplications,
} = require('../controllers/ApplicationController');

// Jobseeker only
router.get('/applied' , auth , isJobSeeker ,getAppliedApplications);
router.post('/apply/:jobId', auth, isJobSeeker, applyForJob); 

router.delete('/withdraw/:appId', auth, isJobSeeker, withdrawApplication);


// Recruiter only
router.put('/accept/:appId', auth, isRecruiter, acceptApplication);
router.put('/reject/:appId', auth, isRecruiter, rejectApplication);
router.get('/applications/:jobId', auth, isRecruiter, listApplications);


module.exports = router;
