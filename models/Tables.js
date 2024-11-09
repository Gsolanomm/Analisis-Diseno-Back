const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Sales = require('./Sales');  // Import the Sales model to define the relationship

// Table model
const Tables = sequelize.define('Tables', {
    tableId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sector: { type: DataTypes.STRING, allowNull: false },
    available: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Define the relationship between Table and Sales
Tables.hasMany(Sales, { foreignKey: 'tableId' });
Sales.belongsTo(Tables, { foreignKey: 'tableId' });

module.exports = Tables;
