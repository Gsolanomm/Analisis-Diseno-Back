const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Dish = require('../models/Dish');

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/dishes');
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
        const { idCategory } = req.query;

        // Verifica si `idCategory` es un número y crea la condición de búsqueda
        const whereCondition = idCategory ? { idCategory: parseInt(idCategory) } : {};


        const { count, rows: dishes } = await Dish.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            dishes,
        });
    } catch (error) {
        console.error("Error listing dishes with pagination:", error);
        res.status(500).json({ error: "Error retrieving dishes" });
    }
});


router.post('/add', upload.single('image'), async (req, res) => {
    let { name, creationDate, description, price, idCategory, idSubCategory } = req.body;
    const validNameDescription = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/;
    name = name.trimEnd();
    description = description.trimEnd();
    
    if (!validNameDescription.test(name) || !validNameDescription.test(description)) {
        return res.status(400).json({ error: "Name and description can only contain letters and numbers, with no symbols or leading spaces." });
    }

    try {
        const filePath = req.file ? `/uploads/dishes/${req.file.filename}` : null;

        const newDish = await Dish.create({
            name,
            creationDate,
            description,
            price,
            idCategory,
            idSubCategory,
            uriImage: filePath
        });
        res.status(201).json(newDish);
    } catch (error) {
        console.error("Error adding the dish:", error);
        res.status(500).json({ error: "Error adding the dish", details: error.message });
    }
});

router.put('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    let { name, description, price, idCategory, idSubCategory } = req.body;
    const validNameDescription = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/;
    name = name.trimEnd();
    description = description.trimEnd();

    if (!validNameDescription.test(name) || !validNameDescription.test(description)) {
        return res.status(400).json({ error: "Name and description can only contain letters and numbers, with no symbols or leading spaces." });
    }

    try {
        const dish = await Dish.findByPk(id);
        if (!dish) {
            return res.status(404).json({ error: "Dish not found" });
        }

        dish.name = name || dish.name;
        dish.description = description || dish.description;
        dish.price = price || dish.price;
        dish.idCategory = idCategory || dish.idCategory;
        dish.idSubCategory = idSubCategory || dish.idSubCategory;

        if (req.file) {
            const oldImagePath = path.join(__dirname, '..', dish.uriImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            dish.uriImage = `/uploads/dishes/${req.file.filename}`;
        }

        await dish.save();
        res.json(dish);
    } catch (error) {
        console.error("Error updating the dish:", error);
        res.status(500).json({ error: "Error updating the dish", details: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedDish = await Dish.destroy({
            where: { idDish: id }
        });
        
        if (!deletedDish) {
            return res.status(404).json({ error: "Dish not found" });
        }
        
        res.status(200).json({ message: "Dish successfully deleted" });
    } catch (error) {
        console.error("Error deleting the dish:", error);
        res.status(500).json({ error: "Error deleting the dish", details: error.message });
    }
});

module.exports = router;
