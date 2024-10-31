// routes/user.js
const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const router = express.Router();

// Obtener lista de usuarios activos con paginación
router.get('/users', verifyToken, checkRole(['administrador']), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: { isActive: true }, // Filtra solo usuarios activos
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});


module.exports = router;


// Ruta para inhabilitar a un usuario
router.put('/disable-user/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        user.isActive = false; // Inhabilita al usuario
        await user.save();

        res.json({ message: 'Usuario inhabilitado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al inhabilitar usuario' });
    }
});

module.exports = router;
