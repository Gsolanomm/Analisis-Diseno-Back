// models/Client_Raffle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Raffle = require('./Raffle');

// Tabla Client_Raffle
const Client_Raffle = sequelize.define('Client_Raffle', {
    idUser: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'idUser' },
        primaryKey: true
    },
    idRaffle: {
        type: DataTypes.INTEGER,
        references: { model: Raffle, key: 'idRaffle' },
        primaryKey: true
    }
});

// Definimos las relaciones
User.belongsToMany(Raffle, { through: Client_Raffle, foreignKey: 'idUser' });
Raffle.belongsToMany(User, { through: Client_Raffle, foreignKey: 'idRaffle' });

module.exports = Client_Raffle;
