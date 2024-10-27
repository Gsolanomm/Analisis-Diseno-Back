const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Notification = sequelize.define('Notification', {
    idNotification: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    numTable: { type: DataTypes.INTEGER, allowNull: false },
    notificationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

User.hasMany(Notification, { foreignKey: 'idClient' });
Notification.belongsTo(User, { foreignKey: 'idClient' });

module.exports = Notification;
