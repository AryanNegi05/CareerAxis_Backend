const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		
		const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode =  jwt.verify(token, process.env.JWT_SECRET);
			console.log(decode);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

exports.isRecruiter = async(req,res,next) => {
  try{
      const role = req.user.role;
      if(role == 'jobseeker'){
        return res.status(401).json({
          message:"This is a Protected Route for Recruiter only"
        })
      }
      next();
  } catch(er){
    return res.status(500).json({
      message:"user cant be verified"
    })
  }
}

exports.isJobSeeker = async(req,res,next) => {
  try{
      const role = req.user.role;
      if(role !== 'jobseeker'){
        return res.status(401).json({
          message:"This is a Protected Route for Jobseeker only"
        })
      }
      next();
  } catch(er){
    return res.status(500).json({
      message:"user cant be verified"
    })
  }
}
