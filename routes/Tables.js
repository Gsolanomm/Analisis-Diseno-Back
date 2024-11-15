// routes/tables.js
const express = require('express');
const Tables = require('../models/Tables');
const router = express.Router();

// Agregar mesa
router.post('/', async (req, res) => {
    const { sector, numMesas } = req.body;

    try {
        const newTables = [];
        let nextNumber = 1; // Empezar el contador desde 1

        // Obtiene las mesas activas en el sector para encontrar el siguiente número
        const existingTables = await Tables.findAll({
            where: { sector: sector, isActived: true }
        });
        if (existingTables.length > 0) {
            // Si hay mesas activas, ajustamos el contador al siguiente número
            nextNumber = Math.max(...existingTables.map(table => table.number)) + 1;
        }

        // Añadir mesas o activar las existentes
        for (let i = 0; i < numMesas; i++) {
            // Verificar si ya existe una mesa con el número
            const existingTable = await Tables.findOne({
                where: { sector: sector, number: nextNumber, isActived: false }
            });

            if (existingTable) {
                // Si la mesa existe pero está inactiva, activarla
                existingTable.isActived = true;
                await existingTable.save();
                newTables.push(existingTable);
            } else {
                // Crear nueva mesa
                const newTable = await Tables.create({
                    sector: sector,
                    number: nextNumber,
                    available: true,
                    isActived: true
                });
                newTables.push(newTable);
            }
            nextNumber++; // Incrementar el número de mesa
        }

        res.status(201).json({ message: `${numMesas} mesas añadidas al sector ${sector}`, tables: newTables });
    } catch (error) {
        res.status(400).json({ error: 'Error al añadir las mesas' });
    }
});

// Listar todas las mesas activas
router.get('/', async (req, res) => {
    try {
        const tables = await Tables.findAll({
            where: { isActived: true } // Filtrar solo las mesas activas
        });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las mesas' });
    }
});


router.get('/sectors', async (req, res) => {
    try {
        // Obtener todos los sectores únicos de la tabla de mesas
        const sectors = await Tables.findAll({
            attributes: ['sector'],
            group: ['sector'], // Agrupar para obtener solo valores únicos
        });

        const sectorNames = sectors.map(sector => sector.sector);
        res.json(sectorNames);
    } catch (error) {
        console.error('Error al obtener los sectores:', error);
        res.status(500).json({ error: 'Error al obtener los sectores' });
    }
});


// Obtener una mesa por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const table = await Tables.findByPk(id);
        if (!table || !table.isActived) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
});
// Actualizar mesas en un sector
router.put('/:sector', async (req, res) => {
    const { sector } = req.params;
    const { newSector, newNumMesas } = req.body;

    try {
        // Obtener mesas activas e inactivas en el sector
        const activeTables = await Tables.findAll({
            where: { sector, isActived: true }
        });
        const inactiveTables = await Tables.findAll({
            where: { sector, isActived: false },
            order: [['number', 'ASC']] // Ordenar por número para reactivar mesas de menor número primero
        });

        const allTables = await Tables.findAll({ where: { sector } });

        const currentActiveCount = activeTables.length;
        
        if (newNumMesas < currentActiveCount) {
            // Desactivar mesas si el nuevo número es menor que el actual
            const tablesToDeactivate = activeTables.slice(newNumMesas);
            await Promise.all(
                tablesToDeactivate.map(table => {
                    table.isActived = false;
                    return table.save();
                })
            );
        } else if (newNumMesas > currentActiveCount) {
            // Activar o crear mesas si el nuevo número es mayor que el actual
            const tablesToActivate = newNumMesas - currentActiveCount;
            let nextNumber = Math.max(...allTables.map(table => table.number)) + 1;

            for (let i = 0; i < tablesToActivate; i++) {
                const inactiveTable = inactiveTables[i];
                if (inactiveTable) {
                    // Reactivar mesas inactivas con el número existente
                    inactiveTable.isActived = true;
                    await inactiveTable.save();
                } else {
                    // Crear nuevas mesas con un número secuencial
                    await Tables.create({
                        sector,
                        number: nextNumber++,
                        available: true,
                        isActived: true
                    });
                }
            }
        }

        // Actualizar el nombre del sector si cambió
        if (newSector !== sector) {
            await Tables.update({ sector: newSector }, { where: { sector } });
        }

        res.status(200).json({ message: `El sector ${sector} fue actualizado correctamente.` });
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el sector y las mesas' });
    }
});


router.put('/changeAvaliable/:tableId', async (req, res) => {
    try {
      const tableId = req.params.tableId;
      const { available } = req.body;
  
      // Validación de entrada
      if (typeof available !== 'boolean') {
        return res.status(400).json({ message: 'El campo "available" debe ser un valor booleano' });
      }
  
      // Actualizar la mesa en la base de datos
      const updatedTable = await Tables.findByPk(tableId);
   

   

      if (!updatedTable) {
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }

      updatedTable.available = true;
      await updatedTable.save();

  
      // Respuesta de éxito
      res.status(200).json({ message: 'Disponibilidad actualizada con éxito', table: updatedTable });
    } catch (error) {
      console.error('Error al actualizar la disponibilidad de la mesa:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });



// Eliminar una mesa (poniendo isActive a false)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const table = await Tables.findByPk(id);
        if (!table || !table.isActived) {
            return res.status(404).json({ error: 'Mesa no encontrada o ya inactiva' });
        }

        // Desactivar la mesa
        table.isActived = false;
        await table.save();

        res.json({ message: 'Mesa desactivada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al desactivar la mesa' });
    }
});

// Exportar el router
module.exports = router;
