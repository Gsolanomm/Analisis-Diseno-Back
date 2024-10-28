// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const accessToken = jwt.sign({ idUser: user.idUser }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ idUser: user.idUser }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.json({ accessToken });
});

// Exporta el router correctamente
module.exports = router;
