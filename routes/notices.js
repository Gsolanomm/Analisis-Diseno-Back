const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Notice = require('../models/Notice');

const router = express.Router();

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/notice');
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

// Obtener todas las noticias
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.findAll();
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error al obtener las noticias:", error);
    res.status(500).json({ error: 'Error al obtener las noticias' });
  }
});

const upload = multer({ storage: storage });
// Crear una nueva noticia
router.post('/', upload.single('image'), async (req, res) => {
  let { title, description, startDate, endDate } = req.body;

  // Permitir letras, números, espacios, y algunos signos de puntuación
  const validNameDescription = /^[\w\s.,-áéíóúÁÉÍÓÚñÑ]+$/; 

  title = title.trim();
  description = description.trim();
  
  if (!validNameDescription.test(title) || !validNameDescription.test(description)) {
    return res.status(400).json({ error: "El título y la descripción pueden contener letras, números, espacios y ciertos signos de puntuación." });
  }

  try {
    const filePath = req.file ? `/uploads/notice/${req.file.filename}` : null;

    const newNotice = await Notice.create({
      title,
      description,
      urlImage: filePath,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.status(201).json(newNotice);
  } catch (error) {
    console.error("Error al crear la noticia:", error);
    res.status(500).json({ error: "Error al crear la noticia", details: error.message });
  }
});

// Actualizar una noticia
router.put('/:idNotice', upload.single('image'), async (req, res) => {
  const { idNotice } = req.params;
  let { title, description, startDate, endDate } = req.body;

  // Permitir letras, números, espacios, y algunos signos de puntuación
  const validNameDescription = /^[\w\s.,-áéíóúÁÉÍÓÚñÑ]+$/;

  title = title.trim();
  description = description.trim();

  if (!validNameDescription.test(title) || !validNameDescription.test(description)) {
    return res.status(400).json({ error: "El título y la descripción pueden contener letras, números, espacios y ciertos signos de puntuación." });
  }

  try {
    const notice = await Notice.findByPk(idNotice);
    if (!notice) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }

    // Actualiza los campos de la noticia
    notice.title = title || notice.title;
    notice.description = description || notice.description;

    // Manejo de la imagen actualizada
    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', notice.urlImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      notice.urlImage = `/uploads/notice/${req.file.filename}`;
    }

    notice.startDate = new Date(startDate) || notice.startDate;
    notice.endDate = new Date(endDate) || notice.endDate;

    await notice.save();
    res.json(notice);
  } catch (error) {
    console.error("Error al actualizar la noticia:", error);
    res.status(500).json({ error: "Error al actualizar la noticia", details: error.message });
  }
});


// Obtener una noticia por id
router.get('/:idNotice', async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.idNotice);
    if (notice) {
      res.status(200).json(notice);
    } else {
      res.status(404).json({ error: 'Noticia no encontrada' });
    }
  } catch (error) {
    console.error("Error al obtener la noticia:", error);
    res.status(500).json({ error: 'Error al obtener la noticia' });
  }
});

// Eliminar una noticia
router.delete('/:idNotice', async (req, res) => {
  const { idNotice } = req.params;

  try {
    const notice = await Notice.findByPk(idNotice);
    if (!notice) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }

    // Eliminar la imagen asociada a la noticia
    if (notice.urlImage) {
      const imagePath = path.join(__dirname, '..', notice.urlImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await notice.destroy();
    res.status(200).json({ message: "Noticia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la noticia:", error);
    res.status(500).json({ error: "Error al eliminar la noticia", details: error.message });
  }
});

module.exports = router;
