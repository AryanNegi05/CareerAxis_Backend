const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/authMiddleware');
const {
  updateRecruiterVerification,
  getPendingRecruiters,
} = require('../controllers/AdminController');

// Recruiter management
router.get('/recruiters', auth, isAdmin, getPendingRecruiters);
router.put('/recruiters/:id/verify', auth, isAdmin, updateRecruiterVerification);

// // User management
// router.get('/users', auth, isAdmin, getAllUsersAdmin);

module.exports = router;
