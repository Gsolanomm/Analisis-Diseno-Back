// middlewares/verifyToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findByPk(decoded.idUser);

    if (!user || user.sessionToken !== decoded.sessionToken) {
      return res.status(403).json({ error: 'Sesión no válida o ha iniciado sesión en otro dispositivo.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}

module.exports = verifyToken;
