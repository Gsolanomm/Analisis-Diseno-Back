const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Menu = sequelize.define('Menu', {
    idMenu: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Menu;
