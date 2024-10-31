// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    idUser: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    dateOfBirth: { type: DataTypes.DATE, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    refreshToken: { type: DataTypes.STRING },
    isOAuthUser: { type: DataTypes.BOOLEAN, defaultValue: false },
    oauthProvider: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('cliente', 'administrador', 'empleado'), defaultValue: 'cliente' },
    sessionToken: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    profileImage: { type: DataTypes.STRING, allowNull: true } // URL de la imagen de perfil
});

module.exports = User;
