const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const database = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/ApplicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/JobRoutes');
const adminRoutes = require('./routes/AdminRoutes')
const cookieParser = require("cookie-parser");


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to DB
database.connect();

// ✅ Apply CORS first
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Your React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // ✅ This allows cookie exchange
}));

// ✅ Parse cookies before routes
app.use(cookieParser());

// ✅ Parse JSON body
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: 'Your server is up and running....'
  });
});

// ✅ Route setup
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/application", applicationRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/admin", adminRoutes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
