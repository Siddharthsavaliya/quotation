const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const response = require("../helper/response");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json(response(false, "Please login to access this resource"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(response(false, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(response(false, "Invalid token"));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          response(false, "You do not have permission to perform this action")
        );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
