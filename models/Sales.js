const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Tables = require('./Tables');

// Modelo de Sales
const Sales = sequelize.define('Sales', {
    idSales: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    state: { type: DataTypes.STRING, allowNull: false,defaultValue: 'Pendiente' },
    owner: { type: DataTypes.STRING, allowNull: false },

});

// Definimos la relación entre Sales y User
User.hasMany(Sales, { foreignKey: 'idEmployee' });
Sales.belongsTo(User, { foreignKey: 'idEmployee' });

Tables.hasMany(Sales, { foreignKey: 'tableId' });
Sales.belongsTo(Tables, { foreignKey: 'tableId' });

module.exports = Sales;
