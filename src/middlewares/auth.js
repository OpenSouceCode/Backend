const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ msg: 'No token found, authorization denied!' });
  }

  // Verify token
  try {
    return jwt.verify(token, config.JWT_SECRET, (error, decoded) => {
      if (error) throw error;

      req.user = decoded.user;
      next();
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error!' });
  }
};

module.exports = auth;
