// middlewares/checkRole.js
function checkRole(allowedRoles) {
    return (req, res, next) => {
      const { role } = req.user;
  
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
  
      next();
    };
  }
  
  module.exports = checkRole;
  