// routes/auth.js
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();
const crypto = require('crypto');


// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/user');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Ruta para actualizar la imagen de perfil
router.post('/actualizarImagen', verifyToken, upload.single('imagen'), async (req, res) => {
  const { id } = req.body;
  if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
  }

  const filePath = `/uploads/user/${req.file.filename}`;
  try {
      const user = await User.findByPk(id);
      if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Si el usuario ya tiene una imagen de perfil, elimina la imagen anterior
      if (user.profileImage && user.profileImage !== '/uploads/default-profile.png') {
          const oldImagePath = path.join(__dirname, '..', user.profileImage);
          if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath); // Elimina el archivo antiguo
          }
      }

      // Actualiza la URL de la imagen en el usuario
      user.profileImage = filePath;
      await user.save();

      res.json({ message: 'Imagen de perfil actualizada', url: `${req.protocol}://${req.get('host')}${filePath}` });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la imagen de perfil' });
  }
});


// Expresión regular para verificar el formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de correo inválido' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      ...req.body, 
      password: hashedPassword, 
      role: role || 'cliente' 
    });
    
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generación de un nuevo sessionToken para validar sesión única
    const newSessionToken = crypto.randomBytes(16).toString('hex');
    user.sessionToken = newSessionToken;
    await user.save();

    const accessToken = jwt.sign(
      { idUser: user.idUser, role: user.role, sessionToken: newSessionToken }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { idUser: user.idUser, sessionToken: newSessionToken }, 
      process.env.REFRESH_TOKEN_SECRET, 
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
      attributes: ['idUser', 'firstName', 'lastName', 'email', 'dateOfBirth', 'role'],
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

// Verificación de rol
router.get('/verify-role', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.idUser);
    //verifica si el usuario existe y muestra los datos de este por consola 
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar el rol del usuario' });
  }
});

// Nueva ruta para actualizar la contraseña
router.put('/update-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.idUser);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Verificar si la contraseña actual es correcta
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

    // Actualizar con la nueva contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
});

// Ruta para obtener la imagen de perfil del usuario autenticado
router.get('/profile-image', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.idUser, {
      attributes: ['profileImage'],
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Devuelve la URL completa de la imagen o una predeterminada si no tiene una
    const profileImageUrl = user.profileImage 
      ? `${req.protocol}://${req.get('host')}${user.profileImage}`
      : `${req.protocol}://${req.get('host')}/uploads/default-profile.png`;

    res.json({ profileImageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la imagen de perfil' });
  }
});

module.exports = router;
