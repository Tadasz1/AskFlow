/**
 * Optional auth: if Authorization: Bearer <token> is present and valid, sets req.user; otherwise req.user = null.
 * Used on GET /question/:id/answers so we can return userVote when logged in.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    req.user = user || null;
  } catch {
    req.user = null;
  }
  return next();
}

module.exports = optionalAuth;
