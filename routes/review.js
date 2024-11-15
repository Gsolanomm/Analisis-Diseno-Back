const express = require('express');
const Review = require('../models/Review');
const router = express.Router();
const User = require('../models/User');

// Listar resenas
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.findAll();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las resenas' });
    }
});

//
router.get('/:idDish', async (req, res) => {
    try {
        const { idDish } = req.params;
        const reviews = await Review.findAll({ 
            include: [{
                model: User,
                attributes:['firstName','lastName']
            }], 
            where: { idDish } 
        })
        res.json(reviews.map(review => {
            if(review.dataValues.anonimus) {
                review.dataValues.User = null;
            }
            return review;
        }));
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las resenas' });
    }
});

// Agregar resenas
router.post('/', async (req, res) => {
    const { rating, comment, anonimus, idUser, idDish } = req.body;
    const commentDate = new Date();
    const reviews = await Review.findAll( { where:{ idUser, idDish } });

    if(reviews.length > 0) {
        res.status(400).json({ error: 'El usuario ya tiene una reseña realizada!' });
        return;
    }

    try {
        const newReview = await Review.create({ rating, comment, commentDate, anonimus, idUser, idDish });
        res.status(201).json({ message: 'Resena añadida', review: newReview });
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir la resena' });
    }
});

// Editar resena
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { rating, comment, anonimus } = req.body;

    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Resena no encontrada' });
        }

        review.rating = rating;
        review.comment = comment;
        review.anonimus = anonimus;

        await review.save();
        res.json({ message: 'Resena actualizada', review });
    } catch (error) {
        res.status(400).json({ error: 'Error al editar la recena' });
    }
});

// Eliminar resena
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ error: 'Resena no encontrada' });
        }

        await review.destroy();
        res.json({ message: 'Resena eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la resena' });
    }
});

module.exports = router;