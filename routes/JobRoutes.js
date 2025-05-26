const express = require('express');
const router = express.Router();
const {auth , isRecruiter , isJobSeeker , isVerifiedRecruiter} = require('../middlewares/authMiddleware')
const {
  createJob,
  updateJob,
  deleteJob,
  getJobDetails,
  getAllJobs,
  getJobsByRecruiter

} = require('../controllers/JobController');

router.get('/my-jobs', auth, isRecruiter,isVerifiedRecruiter, getJobsByRecruiter); //(get request)
router.get('/AllJobs', getAllJobs); 
// Public
router.get('/:id', getJobDetails); //get details of particular job


// Protected - Recruiter only
router.post('/', auth, isRecruiter, isVerifiedRecruiter, createJob);
router.put('/:id', auth, isRecruiter, isVerifiedRecruiter, updateJob);
router.delete('/:id', auth, isRecruiter, isVerifiedRecruiter, deleteJob);


module.exports = router;
