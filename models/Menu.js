const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class RestaurantMenu extends Model {}

RestaurantMenu.init({
    idMenu: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'RestaurantMenu',
    tableName: 'menus',
    timestamps: true,
});

module.exports = RestaurantMenu;

