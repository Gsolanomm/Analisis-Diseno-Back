const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Dish = sequelize.define('Dish', {
    idDish: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    uriImage: { type: DataTypes.STRING },
});

module.exports = Dish;