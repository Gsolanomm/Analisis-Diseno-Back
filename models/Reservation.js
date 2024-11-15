const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Reservation = sequelize.define('Reservation', {
    idReservation: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    namePerson: { type: DataTypes.STRING(255), allowNull: false },
    phoneNumber: { type: DataTypes.STRING(15), allowNull: false },
    reservationDate: { type: DataTypes.DATE, allowNull: false },  
    numPeople: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT },
    reservationTime: { type: DataTypes.STRING(15), allowNull: false } 
});

User.hasMany(Reservation, { foreignKey: 'idClient' });
Reservation.belongsTo(User, { foreignKey: 'idClient' });

module.exports = Reservation;