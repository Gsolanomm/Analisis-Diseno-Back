const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Menu = require('./Menu');
const Category = require('./Category');

const Menu_Category = sequelize.define('Menu_Category', {
    idMenu: { 
        type: DataTypes.INTEGER,
        references: { model: Menu, key: 'idMenu' },
        onDelete: 'CASCADE'
    },
    idCategory: { 
        type: DataTypes.INTEGER,
        references: { model: Category, key: 'idCategory' },
        onDelete: 'CASCADE'
    }
});

Menu.belongsToMany(Category, { through: Menu_Category, foreignKey: 'idMenu' });
Category.belongsToMany(Menu, { through: Menu_Category, foreignKey: 'idCategory' });

module.exports = Menu_Category;
