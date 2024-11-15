const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Dish = require('./Dish');

const Recipe = sequelize.define('Recipe', {
    idRecipe: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    instructions: { type: DataTypes.TEXT, allowNull: false },
    ingredients: { type: DataTypes.TEXT, allowNull: false },
    idDish: {
        type: DataTypes.INTEGER,
        references: { model: Dish, key: 'idDish' },
        onDelete: 'CASCADE'
    }
});

// Definimos la relación entre Recipe y Dish
Dish.hasMany(Recipe, { foreignKey: 'idDish' });
Recipe.belongsTo(Dish, { foreignKey: 'idDish' });

module.exports = Recipe;
