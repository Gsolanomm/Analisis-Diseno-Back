const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Usa 3306 si DB_PORT no está definido
    dialect: 'mysql',
    logging: false,
});

module.exports = sequelize;
