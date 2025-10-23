const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Lipsă header autorizare' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Lipsă token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalid sau expirat' });
  }
};
