const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers["authorization"]?.split(" ")[1]; // Expect a "Bearer <token>" format
  
  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Attach the decoded user information to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    // Handle token verification errors
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = auth;
