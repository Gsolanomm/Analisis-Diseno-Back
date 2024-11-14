const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Raffle = require('../models/Raffle');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const sequelize = require('../db');


// Configuración de multer para guardar imágenes en la carpeta 'uploads/raffle'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/raffle');
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

// Crear una rifa (solo administrador)
router.post('/create', verifyToken, checkRole(['administrador']), upload.single('urlImage'), async (req, res) => {
  const { title, details, startDate, endDate, award } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha proporcionado ningún archivo de imagen' });
  }

  const filePath = `/uploads/raffle/${req.file.filename}`;

  try {
    const raffle = await Raffle.create({
      title,
      details,
      startDate,
      endDate,
      award,
      urlImage: filePath // Guardar solo la URL relativa en la base de datos
    });
    res.status(201).json({
      message: 'Rifa creada exitosamente',
      raffle: {
        ...raffle.get(), // Usar `get` para obtener los datos de la rifa
        urlImage: `${req.protocol}://${req.get('host')}${filePath}` // URL completa de la imagen
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la rifa' });
  }
});

// Participar en una rifa (solo cliente)
router.post('/:raffleId/participate', verifyToken, checkRole(['cliente']), async (req, res) => {
  const { raffleId } = req.params;
  const userId = req.user.idUser;

  try {
    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isParticipating = await raffle.hasUser(user);
    if (isParticipating) {
      return res.status(400).json({ error: 'Ya estas inscrito en esta rifa' });
    }

    await raffle.addUser(user); // Añadir al usuario como participante de la rifa
    res.status(200).json({ message: 'Te has inscrito en la rifa con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al participar en la rifa' });
  }
});

// Actualizar una rifa con imagen opcional (solo administrador)
router.put('/:raffleId', verifyToken, checkRole(['administrador']), upload.single('urlImage'), async (req, res) => {
  const { raffleId } = req.params;
  const { title, details, startDate, endDate, award } = req.body;

  try {
    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });

    // Validaciones de fechas
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser mayor que la fecha de finalización' });
    }

    // Si se carga una nueva imagen, eliminar la anterior
    if (req.file) {
      if (raffle.urlImage) {
        const oldImagePath = path.join(__dirname, '..', raffle.urlImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      raffle.urlImage = `/uploads/raffle/${req.file.filename}`;
    }

    raffle.title = title || raffle.title;
    raffle.details = details || raffle.details;
    raffle.startDate = startDate || raffle.startDate;
    raffle.endDate = endDate || raffle.endDate;
    raffle.award = award || raffle.award;

    await raffle.save();
    res.status(200).json({ message: 'Rifa actualizada exitosamente', raffle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la rifa' });
  }
});

// Eliminar una rifa (solo administrador)
router.delete('/:raffleId', verifyToken, checkRole(['administrador']), async (req, res) => {
  const { raffleId } = req.params;

  try {
    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });

    // Eliminar la imagen de la carpeta 'uploads/raffle'
    if (raffle.urlImage) {
      const imagePath = path.join(__dirname, '..', raffle.urlImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Elimina el archivo de imagen
      }
    }

    await raffle.destroy();
    res.status(200).json({ message: 'Rifa eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la rifa' });
  }
});

// Endpoint to get all raffles
router.get('/all', async (req, res) => {
  try {
    const raffles = await Raffle.findAll();

    // Map over each raffle and append the full URL to the image path
    const rafflesWithFullUrl = raffles.map(raffle => {
      const fullImageUrl = raffle.urlImage
        ? `${req.protocol}://${req.get('host')}${raffle.urlImage}`
        : `${req.protocol}://${req.get('host')}/uploads/default-raffle.png`; // Fallback image if none is set
      return {
        ...raffle.get(),
        urlImage: fullImageUrl
      };
    });

    res.status(200).json(rafflesWithFullUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las rifas' });
  }
});

// Seleccionar un ganador para una rifa específica (solo administrador)
router.post('/:raffleId/select-winner', verifyToken, checkRole(['administrador']), async (req, res) => {
  const { raffleId } = req.params;

  try {
    // Buscar la rifa
    const raffle = await Raffle.findByPk(raffleId);
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });


    // Seleccionar un usuario ganador al azar de los participantes de la rifa desde la base de datos
    const [winner] = await sequelize.query(
      `
      SELECT users.idUser, users.firstName, users.email
      FROM users
      JOIN client_raffles ON users.idUser = client_raffles.idUser
      WHERE client_raffles.idRaffle = :raffleId
      ORDER BY RAND()
      LIMIT 1
      `,
      {
        replacements: { raffleId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Verificar si hay un ganador
    if (!winner) {
      return res.status(400).json({ error: 'No hay participantes en esta rifa' });
    }

    res.status(200).json({
      message: 'Ganador seleccionado con éxito',
      winner: {
        idUser: winner.idUser,
        name: winner.firstName, // Ajustar según los campos del modelo User
        email: winner.email, // Ajustar según los campos del modelo User
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al seleccionar el ganador' });
  }
});


module.exports = router;
