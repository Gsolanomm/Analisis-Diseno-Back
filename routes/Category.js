// routes/category.js
const express = require('express');
const Category = require('../models/Category'); // Asegúrate de tener un modelo Category definido
const router = express.Router();

// Agregar categoría
router.post('/', async (req, res) => {
    const { name } = req.body;

    try {
        const newCategory = await Category.create({ name });
        res.status(201).json({ message: 'Categoría añadida', category: newCategory });
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir la categoría' });
    }
});

// Listar categorías
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las categorías' });
    }
});

// Editar categoría
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        category.name = name;
        await category.save();
        res.json({ message: 'Categoría actualizada', category });
    } catch (error) {
        res.status(400).json({ error: 'Error al editar la categoría' });
    }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        await category.destroy();
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
});

// Exporta el router correctamente
module.exports = router;
