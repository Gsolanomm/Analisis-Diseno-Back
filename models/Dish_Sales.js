const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Dish = require('./Dish');
const Sales = require('./Sales');

// Tabla DishSales
const Dish_Sales = sequelize.define('Dish_Sales', {
    idDish: { 
        type: DataTypes.INTEGER, 
        references: { model: Dish, key: 'idDish' },
        primaryKey: true
    },
    idSales: { 
        type: DataTypes.INTEGER, 
        references: { model: Sales, key: 'idSales' },
        primaryKey: true
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 } // Cantidad de platillos
});

// Definimos las relaciones
Dish.hasMany(Dish_Sales, { foreignKey: 'idDish' });
Dish_Sales.belongsTo(Dish, { foreignKey: 'idDish' });

Sales.hasMany(Dish_Sales, { foreignKey: 'idSales' });
Dish_Sales.belongsTo(Sales, { foreignKey: 'idSales' });

module.exports = Dish_Sales;
