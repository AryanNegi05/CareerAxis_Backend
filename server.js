const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const database = require('./config/database')
const authRoutes = require('./routes/authRoutes')
const applicationRoutes = require('./routes/ApplicationRoutes')
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/JobRoutes')
const cookieParser = require("cookie-parser");


require('dotenv').config();

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 5000;
database.connect();
app.use(express.json());
 

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/application", applicationRoutes);
app.use("/api/v1/jobs", jobRoutes);

app.use('/api/v1/profile', profileRoutes);


app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})

