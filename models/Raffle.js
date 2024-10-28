// models/Raffle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Raffle = sequelize.define('Raffle', {
    idRaffle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    urlImage: {
        type: DataTypes.STRING(255)
    },
    details: {
        type: DataTypes.TEXT
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    award: {
        type: DataTypes.STRING(255)
    }
});

module.exports = Raffle;
