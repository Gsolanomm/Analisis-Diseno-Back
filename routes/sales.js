// routes/sales.js
const express = require('express');
const Sales = require('../models/Sales'); // Asegúrate de tener un modelo Sales definido
const router = express.Router();

// Agregar venta
router.post('/:idEmployee/:numTable', async (req, res) => {
    const { idEmployee, numTable } = req.params; // Extraemos los parámetros de la URL

    try {
        const newSale = await Sales.create({ 
            numTable: numTable, 
            idEmployee: idEmployee 
        });
        res.status(201).json({ message: 'Venta añadida', sale: newSale });
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir la venta' });
    }
});

// Listar todas las ventas
router.get('/', async (req, res) => {
    try {
        const sales = await Sales.findAll();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las ventas' });
    }
});

// Obtener una venta por id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const sale = await Sales.findByPk(id);
        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la venta' });
    }
});

// Editar una venta
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { numTable, idEmployee } = req.body;

    try {
        const sale = await Sales.findByPk(id);
        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        // Actualizar la venta
        sale.numTable = numTable;
        sale.idEmployee = idEmployee;
        await sale.save();

        res.json({ message: 'Venta actualizada', sale });
    } catch (error) {
        res.status(400).json({ error: 'Error al editar la venta' });
    }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sale = await Sales.findByPk(id);
        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        // Eliminar la venta
        await sale.destroy();
        res.json({ message: 'Venta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la venta' });
    }
});

// Exporta el router correctamente
module.exports = router;
