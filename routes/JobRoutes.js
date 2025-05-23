const express = require('express');
const router = express.Router();
const {auth , isRecruiter , isJobSeeker} = require('../middlewares/authMiddleware')
const {
  createJob,
  updateJob,
  deleteJob,
  getJobDetails,
  getAllJobs,
  getJobsByRecruiter

} = require('../controllers/JobController');

router.get('/my-jobs', auth, isRecruiter, getJobsByRecruiter); //(get request)
router.get('/AllJobs', getAllJobs); 
// Public
router.get('/:id', getJobDetails); //get details of particular job


// Protected - Recruiter only
router.post('/', auth, isRecruiter, createJob); // / jobs/
router.put('/:id', auth, isRecruiter, updateJob); // / jobs/id (put request)
router.delete('/:id', auth, isRecruiter, deleteJob); // / jobs/id (delete request)


module.exports = router;
