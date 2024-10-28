const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Category = require('./Category');

const SubCategory = sequelize.define('SubCategory', {
    idSubCategory: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idCategory: { 
        type: DataTypes.INTEGER, 
        references: { model: Category, key: 'idCategory' },
        onDelete: 'CASCADE'
    },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
});

Category.hasMany(SubCategory, { foreignKey: 'idCategory' });
SubCategory.belongsTo(Category, { foreignKey: 'idCategory' });

module.exports = SubCategory;
