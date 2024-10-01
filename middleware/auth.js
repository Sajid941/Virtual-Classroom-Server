const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Retrieve the token from the cookies
  const token = req.cookies?.token;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access, token missing" });
  }

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ message: "Unauthorized access, token invalid" });
    }

    // Attach decoded user information to the request
    req.user = decoded;

    // Continue to the next middleware or route
    next();
  });
};

module.exports = auth;
