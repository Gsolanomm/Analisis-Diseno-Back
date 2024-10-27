const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Dish = require('./Dish');

const Review = sequelize.define('Review', {
    idReview: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idUser: { 
        type: DataTypes.INTEGER, 
        references: { model: User, key: 'idUser' },
        onDelete: 'CASCADE' // Eliminar reseñas si se elimina el usuario
    },
    idDish: { 
        type: DataTypes.INTEGER, 
        references: { model: Dish, key: 'idDish' },
        onDelete: 'CASCADE' // Eliminar reseñas si se elimina el plato
    },
    rating: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        validate: { min: 1, max: 5 } // Aseguramos que el rating esté entre 1 y 5
    },
    comment: { type: DataTypes.TEXT },
    commentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    anonimus: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Definimos las relaciones
User.hasMany(Review, { foreignKey: 'idUser' });
Review.belongsTo(User, { foreignKey: 'idUser' });

Dish.hasMany(Review, { foreignKey: 'idDish' });
Review.belongsTo(Dish, { foreignKey: 'idDish' });

module.exports = Review;
