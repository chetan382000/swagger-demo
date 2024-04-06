const jwt = require("jsonwebtoken");
require('dotenv').config();

const JWTSECRETKEY = process.env.JWTSECRETKEY


const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access denied, token missing or invalid" });
  }

  // Extract token from header
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWTSECRETKEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Access denied, invalid token" });
  }
};

module.exports = {
  verifyToken
};