// routes/tables.js
const express = require('express');
const Tables = require('../models/Tables'); // Asegúrate de tener un modelo Table definido
const router = express.Router();

// Agregar mesa
router.post('/', async (req, res) => {
    const { sector, numMesas } = req.body;

    try {
        const newTables = [];
        for (let i = 0; i < numMesas; i++) {
            const newTable = await Tables.create({
                sector: sector,
                available: true,
            });
            newTables.push(newTable);
        }
        res.status(201).json({ message: `${numMesas} mesas añadidas al sector ${sector}`, tables: newTables });
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir las mesas' });
    }
});

// Listar todas las mesas
router.get('/', async (req, res) => {
    try {
        const tables = await Tables.findAll();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las mesas' });
    }
});

// Obtener una mesa por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const table = await Tables.findByPk(id);
        if (!table) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
});

router.put('/edit/:sectorName', async (req, res) => {
    const { sectorName } = req.params;
    const { newSector, newNumMesas } = req.body;

    try {
        // Buscar todas las mesas del sector actual
        const existingTables = await Tables.findAll({ where: { sector: sectorName } });
        const existingCount = existingTables.length;

        // Actualizar el nombre del sector para todas las mesas actuales
        for (let table of existingTables) {
            table.sector = newSector;
            await table.save();
        }

        // Añadir mesas si newNumMesas > existingCount
        if (newNumMesas > existingCount) {
            const mesasToAdd = newNumMesas - existingCount;
            for (let i = 0; i < mesasToAdd; i++) {
                await Tables.create({ sector: newSector, available: true });
            }
        }
        // Eliminar mesas si newNumMesas < existingCount
        else if (newNumMesas < existingCount) {
            const mesasToDelete = existingCount - newNumMesas;
            for (let i = 0; i < mesasToDelete; i++) {
                await existingTables[existingCount - 1 - i].destroy();
            }
        }

        res.json({ message: `Sector ${sectorName} actualizado a ${newSector} con ${newNumMesas} mesas` });
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el sector' });
    }
});


// Exporta el router correctamente
module.exports = router;
