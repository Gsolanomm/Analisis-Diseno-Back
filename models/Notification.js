const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Tables = require('./Tables'); // Importamos el modelo Tables

const Notification = sequelize.define('Notification', {
    idNotification: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    idTable: {
        type: DataTypes.INTEGER,
        references: {
            model: Tables,  // Relación con la tabla Tables
            key: 'tableId'  // Llave primaria de Tables
        },
        allowNull: true, // Puede ser nulo si la notificación no está asociada a una mesa
    }
});

// Relaciones
User.hasMany(Notification, { foreignKey: 'idClient' });
Notification.belongsTo(User, { foreignKey: 'idClient' });

Tables.hasMany(Notification, { foreignKey: 'idTable' });
Notification.belongsTo(Tables, { foreignKey: 'idTable' });

module.exports = Notification;
