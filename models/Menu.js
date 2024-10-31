const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RestaurantMenu = sequelize.define('Menu', {
    idMenu: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    creationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: true }
}, {
    timestamps: false 
});

module.exports = RestaurantMenu;
