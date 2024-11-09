const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

// Modelo de Sales
const Sales = sequelize.define('Sales', {
    idSales: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    saleDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    numTable: { type: DataTypes.INTEGER, allowNull: false }
});

// Definimos la relación entre Sales y User
User.hasMany(Sales, { foreignKey: 'idEmployee' });
Sales.belongsTo(User, { foreignKey: 'idEmployee' });

module.exports = Sales;
