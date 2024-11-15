// routes/sales.js
const express = require('express');
const Sales = require('../models/Sales'); // Asegúrate de tener un modelo Sales definido
const Dish_Sales = require('../models/Dish_Sales');
const Dishes = require('../models/Dish');
const table = require('../models/Tables');
const Users = require('../models/User');
const router = express.Router();
const { Op } = require('sequelize');

router.post('/:idEmployee', async (req, res) => {
    const { idEmployee } = req.params;
    const { tableId, sectorName, customerName, items, total } = req.body;

    try {
        // Crear la venta
        const newSale = await Sales.create({
            state: 'Pendiente',
            owner: customerName,
            idEmployee,
            tableId: tableId,
            sector: sectorName,
            totalAmount: total
        });

await table.update({available: false}, {where: {tableId: tableId}});


        // Crear los registros en Dish_Sales para cada plato de la orden
        for (const item of items) {
            await Dish_Sales.create({
                idDish: item.idDish,
                idSales: newSale.idSales,
                quantity: item.quantity,
                note: item.note || ''
            });
        }

        res.status(201).json({ message: 'Venta añadida con detalles', sale: newSale });
    } catch (error) {
        console.error('Error al añadir la venta:', error);
        res.status(400).json({ error: 'Error al añadir la venta' });
    }
});



// Ruta para obtener las ventas con platos
// Ruta para obtener las ventas con platos y mesas
router.get('/', async (req, res) => {
    try {
        const sales = await Sales.findAll({
            where: {
                state: { [Op.ne]: 'Pagado' } // Excluir las ventas con estado "Pagado"
            }
        });

        // Array de idSales
        const salesIds = sales.map(sale => sale.idSales);

        // Obtener los platos relacionados con las ventas
        const dishSales = await Dish_Sales.findAll({
            where: {
                idSales: salesIds,
            },
        });

        // Obtener los ids de los platos
        const dishIds = dishSales.map(dishSale => dishSale.idDish);

        // Ahora, obtenemos los platos correspondientes a esos idDish
        const dishes = await Dishes.findAll({
            where: {
                idDish: dishIds,
            },
        });

        // Obtener la información de las mesas usando el tableId de cada venta
        const tableIds = sales.map(sale => sale.tableId);
        const tables = await table.findAll({
            where: {
                tableId: tableIds,  // Asumiendo que el campo id en la tabla Tables es el tableId
            },
        });

        // Asociamos los platos, mesas y usuarios a cada venta
        const salesWithDishesAndTables = await Promise.all(sales.map(async (sale) => {
            // Obtener los platos asociados a cada venta
            const dishesForSale = dishSales
                .filter(dishSale => dishSale.idSales === sale.idSales)
                .map(dishSale => {
                    const dish = dishes.find(dish => dish.idDish === dishSale.idDish);
                    return {
                        idDish: dish.idDish,
                        name: dish.name,
                        price: dish.price,
                        quantity: dishSale.quantity,
                        note: dishSale.note,
                    };
                });

            // Obtener la mesa asociada a la venta
            const table = tables.find(table => table.tableId === sale.tableId);

            // Obtener el empleado asociado a la venta (idEmployee)
            const user = await Users.findByPk(sale.idEmployee);

            return {
                idSales: sale.idSales,
                state: sale.state,
                owner: sale.owner,
                idEmployee: sale.idEmployee,
                tableId: sale.tableId,
                table: table ? {
                    tableId: table.tableId,
                    number: table.number,
                    sector: table.sector,
                    available: table.available
                } : null, // Añadir solo la mesa si existe
                dishes: dishesForSale, // Añadir los platos a la venta
                user: user ? {
                    firstName: user.firstName,
                    lastName: user.lastName
                } : null, // Información del empleado
            };
        }));

        res.json(salesWithDishesAndTables);
    } catch (error) {
        console.error('Error al obtener las ventas con platos, mesas y empleados:', error);
        res.status(500).json({ error: 'Error al obtener las ventas con platos, mesas y empleados' });
    }
});


// Nueva ruta para obtener detalles de una venta específica
router.get('/:idSales', async (req, res) => {
    try {
        const { idSales } = req.params;
        const sale = await Sales.findByPk(idSales);

        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        // Obtener los platos asociados a la venta
        const dishSales = await Dish_Sales.findAll({
            where: {
                idSales: sale.idSales,
            },
        });

        const dishIds = dishSales.map(dishSale => dishSale.idDish);
        const dishes = await Dishes.findAll({
            where: {
                idDish: dishIds,
            },
        });

        const dishesForSale = dishSales.map(dishSale => {
            const dish = dishes.find(d => d.idDish === dishSale.idDish);
            return {
                idDish: dish.idDish,
                name: dish.name,
                price: dish.price,
                quantity: dishSale.quantity,
                note: dishSale.note,
            };
        });

        // Obtener los detalles de la mesa y el empleado
        const table = await Tables.findByPk(sale.tableId);
        const user = await Users.findByPk(sale.idEmployee);

        // Formatear la respuesta
        const saleDetails = {
            idSales: sale.idSales,
            state: sale.state,
            owner: sale.owner,
            idEmployee: sale.idEmployee,
            table: table ? {
                number: table.number,
                sector: table.sector,
                available: table.available,
            } : null,
            dishes: dishesForSale,
            user: user ? {
                firstName: user.firstName,
                lastName: user.lastName,
            } : null,
        };

        res.json(saleDetails);
    } catch (error) {
        console.error('Error al obtener los detalles de la venta:', error);
        res.status(500).json({ error: 'Error al obtener los detalles de la venta' });
    }
});


// Editar el estado de una venta
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { state } = req.body; // Asegúrate de que el nuevo estado esté en el body de la solicitud

    try {
        const sale = await Sales.findByPk(id);
        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        // Actualizar el estado de la venta
        sale.state = state;
        await sale.save();

        res.json({ message: 'Estado de la venta actualizado', sale });
    } catch (error) {
        res.status(400).json({ error: 'Error al editar el estado de la venta' });
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
