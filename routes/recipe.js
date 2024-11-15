const express = require('express');
const Recipe = require('../models/Recipe');
const router = express.Router();

// Listar recetas
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.findAll();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las recetas' });
    }
});

//
router.get('/:idDish', async (req, res) => {
    try {
        const { idDish } = req.params;
        const recipes = await Recipe.findOne({ where: { idDish } })
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar la receta' });
    }
});

// Agregar receta
router.post('/', async (req, res) => {
    const { instructions, ingredients, idDish } = req.body;

    try {

        const recipes = await Recipe.findOne({ where: { idDish } });
        if (recipes != null) {
            return res.status(400).json({ error: 'El platillo ya tiene una receta' });
        }

        const newRecipe = await Recipe.create({ instructions, ingredients, idDish });
        res.status(201).json({ message: 'Receta añadida', recipe: newRecipe });
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir la receta' });
    }
});

// Editar receta
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { instructions, ingredients } = req.body;

    try {
        const recipe = await Recipe.findByPk(id);

        if (!recipe) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        recipe.instructions = instructions;
        recipe.ingredients = ingredients;

        await recipe.save();
        res.json({ message: 'Receta actualizada', recipe });
    } catch (error) {
        res.status(400).json({ error: 'Error al editar la receta' });
    }
});

// Eliminar receta
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        await recipe.destroy();
        res.json({ message: 'Receta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la receta' });
    }
});

module.exports = router;