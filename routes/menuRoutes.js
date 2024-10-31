// routes/menuRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const RestaurantMenu = require('../models/Menu'); // Importa el modelo

const router = express.Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/menu');
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

// Ruta para listar todos los elementos del menú
router.get('/list', async (req, res) => {
    try {
        const menus = await RestaurantMenu.findAll();
        res.json(menus);
    } catch (error) {
        console.error("Error al listar menús:", error);
        res.status(500).json({ error: "Error al obtener los menús" });
    }
});

// Ruta para agregar un nuevo elemento al menú
router.post('/add', upload.single('image'), async (req, res) => {
    const { name, creationDate, description, price } = req.body;

    try {
        const filePath = req.file ? `/uploads/menu/${req.file.filename}` : null;

        const newMenu = await RestaurantMenu.create({
            name,
            creationDate,
            description,
            price,
            imageUrl: filePath
        });
        res.status(201).json(newMenu); // Devuelve el nuevo elemento creado
    } catch (error) {
        console.error("Error al agregar el elemento al menú:", error);
        res.status(500).json({ error: "Error al agregar el elemento al menú", details: error.message });
    }
});

// Ruta para actualizar un elemento del menú
router.put('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    try {
        const menu = await RestaurantMenu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ error: "Elemento del menú no encontrado" });
        }
        menu.name = name || menu.name;
        menu.description = description || menu.description;
        menu.price = price || menu.price;

        // Si se proporciona una nueva imagen, actualizar el campo imageUrl
        if (req.file) {
            const oldImagePath = path.join(__dirname, '..', menu.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath); // Elimina el archivo antiguo
            }
            menu.imageUrl = `/uploads/menu/${req.file.filename}`;
        }

        await menu.save();
        res.json(menu); // Devuelve el elemento actualizado
    } catch (error) {
        console.error("Error al actualizar el elemento del menú:", error);
        res.status(500).json({ error: "Error al actualizar el elemento del menú", details: error.message });
    }
});

// Ruta para eliminar un elemento del menú
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMenu = await RestaurantMenu.destroy({
            where: { idMenu: id }
        });
        
        if (!deletedMenu) {
            return res.status(404).json({ error: "Elemento del menú no encontrado" });
        }
        
        res.status(200).json({ message: "Elemento del menú eliminado correctamente" }); // Mensaje de éxito
    } catch (error) {
        console.error("Error al eliminar el elemento del menú:", error);
        res.status(500).json({ error: "Error al eliminar el elemento del menú", details: error.message });
    }
});

module.exports = router;
