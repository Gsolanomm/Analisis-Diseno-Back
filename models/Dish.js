const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Category = require('./Category');
const SubCategory = require('./SubCategory');

const Dish = sequelize.define('Dish', {
    idDish: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    uriImage: { type: DataTypes.STRING },
    idCategory: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'idCategory'
        },
        onDelete: 'CASCADE'
    },
    idSubCategory: {
        type: DataTypes.INTEGER,
        references: {
            model: SubCategory,
            key: 'idSubCategory'
        },
        onDelete: 'CASCADE'
    }
});

// Relaciones
Category.hasMany(Dish, { foreignKey: 'idCategory' });
Dish.belongsTo(Category, { foreignKey: 'idCategory' });

SubCategory.hasMany(Dish, { foreignKey: 'idSubCategory' });
Dish.belongsTo(SubCategory, { foreignKey: 'idSubCategory' });

module.exports = Dish;
