const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Dish = require('./Dish');
const SubCategory = require('./SubCategory');

const Dish_SubCategory = sequelize.define('Dish_SubCategory', {
    idDish: { 
        type: DataTypes.INTEGER,
        references: { model: Dish, key: 'idDish' },
        onDelete: 'CASCADE'
    },
    idSubCategory: { 
        type: DataTypes.INTEGER,
        references: { model: SubCategory, key: 'idSubCategory' },
        onDelete: 'CASCADE'
    }
});

Dish.belongsToMany(SubCategory, { through: Dish_SubCategory, foreignKey: 'idDish' });
SubCategory.belongsToMany(Dish, { through: Dish_SubCategory, foreignKey: 'idSubCategory' });

module.exports = Dish_SubCategory;
