// routes/subcategory.js
const express = require('express');
const SubCategory = require('../models/SubCategory'); // Asegúrate de tener un modelo SubCategory definido
const { now } = require('sequelize/lib/utils');
const router = express.Router();

// Agregar subcategoría
router.post('/', async (req, res) => {
    const { idCategory, name } = req.body;

    try {
        const newSubCategory = await SubCategory.create({ idCategory, name, });
        res.status(201).json({ message: 'Subcategoría añadida', subCategory: newSubCategory });
        
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir la subcategoría' });
    }
});

// Listar subcategorías
router.get('/', async (req, res) => {
    try {
        const subCategories = await SubCategory.findAll();
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las subcategorías' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const subCategories = await SubCategory.findAll({ where: { idCategory: id } });
        res.json(subCategories);
        
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las subcategorías' });
    }
});

// Editar subcategoría
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, idCategory } = req.body;

    try {
        const subCategory = await SubCategory.findByPk(id);
        if (!subCategory) {
            return res.status(404).json({ error: 'Subcategoría no encontrada' });
        }

        subCategory.name = name;
        subCategory.idCategory = idCategory;
        subCategory.updatedAt = new Date();
   
        await subCategory.save();
        res.json({ message: 'Subcategoría actualizada', subCategory });
    } catch (error) {
        res.status(400).json({ error: 'Error al editar la subcategoría' });
    }
});

// Eliminar subcategoría
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const subCategory = await SubCategory.findByPk(id);
        if (!subCategory) {
            return res.status(404).json({ error: 'Subcategoría no encontrada' });
        }

        await subCategory.destroy();
        res.json({ message: 'Subcategoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la subcategoría' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;  // Solo se actualiza el nombre en este caso

    try {
        // Buscar la subcategoría por su ID
        const subCategory = await SubCategory.findByPk(id);

        // Validar si la subcategoría existe
        if (!subCategory) {
            return res.status(404).json({ error: 'Subcategoría no encontrada' });
        }

        // Actualizar el nombre de la subcategoría
        subCategory.name = name;
        await subCategory.save();

        // Enviar la respuesta con la subcategoría actualizada
        res.json({ message: 'Subcategoría actualizada', subCategory });
    } catch (error) {
        console.error('Error al editar la subcategoría:', error);
        res.status(500).json({ error: 'Error al editar la subcategoría' });
    }
});

// Exporta el router
module.exports = router;
