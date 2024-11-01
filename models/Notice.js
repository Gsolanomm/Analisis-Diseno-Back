const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notice = sequelize.define('Notice', {
    idNotice: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    urlImage: {
        type: DataTypes.STRING(255)
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

module.exports = Notice;