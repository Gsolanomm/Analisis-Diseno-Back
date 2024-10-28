const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Reservation = sequelize.define('Reservation', {
    idReservation: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    phoneNumber: { type: DataTypes.STRING(15), allowNull: false },
    reservationDate: { type: DataTypes.DATE, allowNull: false },
    areas: { type: DataTypes.JSON },  // Áreas en formato JSON
    numPeople: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT }
});

User.hasMany(Reservation, { foreignKey: 'idClient' });
Reservation.belongsTo(User, { foreignKey: 'idClient' });

module.exports = Reservation;
