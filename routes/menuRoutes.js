// menuRoutes.js
const express = require('express');
const router = express.Router();
const RestaurantMenu = require('../models/Menu'); // Importa el modelo

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
router.post('/add', async (req, res) => {
    const { name, creationDate, description, price, imageUrl } = req.body;

    try {
        const newMenu = await RestaurantMenu.create({
            name,
            creationDate,
            description,
            price,
            imageUrl
        });
        res.status(201).json(newMenu); // Devuelve el nuevo elemento creado
    } catch (error) {
        console.error("Error al agregar el elemento al menú:", error);
        res.status(500).json({ error: "Error al agregar el elemento al menú", details: error.message });
    }
});

// Ruta para actualizar un elemento del menú
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, imageUrl } = req.body;

    try {
        const menu = await RestaurantMenu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ error: "Elemento del menú no encontrado" });
        }
        menu.name = name;
        menu.description = description;
        menu.price = price;
        menu.imageUrl = imageUrl;
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
