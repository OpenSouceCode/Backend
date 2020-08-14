const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = async (req, res, next) => {
  // Get token from header
  const tokenArray = req.header('Authorization').split(' ');
  const token = tokenArray[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }

  // Verify token
  try {
    return jwt.verify(token, config.JWT_SECRET, (error, decoded) => {
      if (error) throw error;

      req.user = decoded.user;
      next();
    });
  } catch (err) {
    return res.status(403).json({ message: 'Access denied!' });
  }
};

module.exports = auth;
