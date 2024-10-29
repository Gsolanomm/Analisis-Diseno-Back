// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();
require('dotenv').config();

// Expresión regular para verificar el formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de formato de correo
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de correo inválido' });
    }

    // Verificación de correo existente
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hashear la contraseña y crear el usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });
    res.status(201).json({ message: 'Usuario registrado', user });
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // Validación de credenciales
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generación de tokens
    const accessToken = jwt.sign({ idUser: user.idUser }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ idUser: user.idUser }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    // Guardar refresh token en el usuario
    user.refreshToken = refreshToken;
    await user.save();

    // Configuración de cookie segura para el refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo seguro en producción
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener datos del usuario autenticado
router.get('/user', verifyToken, async (req, res) => {

  try {
    const user = await User.findByPk(req.user.idUser, {
      attributes: ['idUser', 'firstName', 'lastName', 'email', 'dateOfBirth'],
    });
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});

// Editar datos del usuario autenticado
router.put('/user', verifyToken, async (req, res) => {
  const { firstName, lastName, dateOfBirth, email } = req.body;

  try {
    const user = await User.findByPk(req.user.idUser);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Actualiza los campos permitidos
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.email = email || user.email;

    await user.save();

    res.json({ message: 'Datos del usuario actualizados correctamente', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar datos del usuario' });
  }
});

module.exports = router;
