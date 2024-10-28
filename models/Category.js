const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// Tabla Category
const Category = sequelize.define('Category', {
    idCategory: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

module.exports = Category;