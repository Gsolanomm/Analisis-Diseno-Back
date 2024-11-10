const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const RestaurantMenu = require('../models/Menu');

const router = express.Router();
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

router.get('/list', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit; 

        const { count, rows: menus } = await RestaurantMenu.findAndCountAll({
            offset: offset,
            limit: limit,
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            menus,
        });
    } catch (error) {
        console.error("Error al listar menús con paginación:", error);
        res.status(500).json({ error: "Error al obtener los menús" });
    }
});

router.post('/add', upload.single('image'), async (req, res) => {
    let { name, creationDate, description, price } = req.body;
    const validNameDescription = /^[a-zA-Z0-9\s\.,\-!@#\$%\^&\*\(\)\[\]{}<>:;'"`~]+$/;
    name = name.trimEnd();
    description = description.trimEnd();

    if (!validNameDescription.test(name) || !validNameDescription.test(description)) {
        return res.status(400).json({ error: "El nombre y la descripción contienen caracteres no permitidos." });
    }

    try {
        const filePath = req.file ? `/uploads/menu/${req.file.filename}` : null;

        const newMenu = await RestaurantMenu.create({
            name,
            creationDate,
            description,
            price,
            imageUrl: filePath
        });
        res.status(201).json(newMenu);
    } catch (error) {
        console.error("Error al agregar el elemento al menú:", error);
        res.status(500).json({ error: "Error al agregar el elemento al menú", details: error.message });
    }
});

router.put('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    let { name, description, price } = req.body;
    const validNameDescription = /^[a-zA-Z0-9\s\.,\-!@#\$%\^&\*\(\)\[\]{}<>:;'"`~]+$/;
    name = name.trimEnd();
    description = description.trimEnd();

    if (!validNameDescription.test(name) || !validNameDescription.test(description)) {
        return res.status(400).json({ error: "El nombre y la descripción contienen caracteres no permitidos." });
    }

    try {
        const menu = await RestaurantMenu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ error: "Elemento del menú no encontrado" });
        }

        menu.name = name || menu.name;
        menu.description = description || menu.description;
        menu.price = price || menu.price;

        if (req.file) {
            const oldImagePath = path.join(__dirname, '..', menu.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            menu.imageUrl = `/uploads/menu/${req.file.filename}`;
        }

        await menu.save();
        res.json(menu);
    } catch (error) {
        console.error("Error al actualizar el elemento del menú:", error);
        res.status(500).json({ error: "Error al actualizar el elemento del menú", details: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMenu = await RestaurantMenu.destroy({
            where: { idMenu: id }
        });
        
        if (!deletedMenu) {
            return res.status(404).json({ error: "Elemento del menú no encontrado" });
        }
        
        res.status(200).json({ message: "Elemento del menú eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el elemento del menú:", error);
        res.status(500).json({ error: "Error al eliminar el elemento del menú", details: error.message });
    }
});

module.exports = router;
