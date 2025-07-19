const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
// exports.authorizeRoles = (...roles) => { // This is a higher-order function
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Not authenticated to check roles." });
//     }
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
//     }
//     next();
//   };
// };
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
