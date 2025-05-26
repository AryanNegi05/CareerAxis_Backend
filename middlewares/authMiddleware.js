const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		// console.log("reached here");
		
		// console.log("cookies oyo" , req.cookies);
		let token = req.cookies.token || req.body.token;
		// console.log("middleware" , token);
		// console.log(req.headers);
		

		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
		token = req.headers.authorization.split(" ")[1];
		}

		// console.log(token);
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
    console.log("recuiter check")
      const role = req.user.role;  
      console.log(role);    
      if(role == 'jobseeker' || role == 'admin'){
        return res.status(401).json({
          message:"This is a Protected Route for Recruiter only"
        })
      }
      console.log("isrecruiterpassed");
      
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

exports.isVerifiedRecruiter = async (req, res, next) => {
    try {
      console.log("iseverified check")
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        if (user.role !== 'recruiter') {
            return res.status(403).json({
                message: 'Only recruiters can access this route',
            });
        }

        if (user.verificationStatus == 'pending' || user.verificationStatus == 'rejected') {
            return res.status(403).json({
                message: 'Recruiter is not verified yet',
            });
        }

        console.log("what");

        next();
    } catch (err) {
        return res.status(500).json({
            message: 'Could not verify recruiter',
        });
    }
};
// Example middleware to check admin role
exports.isAdmin = async(req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
}

