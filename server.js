// server.js
const express = require('express');
const sequelize = require('./db'); // Asegúrate de que la ruta sea correcta
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport'); // Importa la configuración de Passport
const cors = require('cors');

const authRoutes = require('./routes/auth');    // Importa el archivo auth.js
const oauthRoutes = require('./routes/oauth');  // Importa el archivo oauth.js

// Importa los modelos aquí
const User = require('./models/User');
const Dish = require('./models/Dish');
const Review = require('./models/Review');
const Sales = require('./models/Sales');
const Dish_Sales = require('./models/Dish_Sales');
const SubCategory = require('./models/SubCategory');
const Category = require('./models/Category');
const Recipe = require('./models/Recipe');
const Menu = require('./models/Menu');
const Notification = require('./models/Notification');
const Reservation = require('./models/Reservation');
const Menu_Category = require('./models/Menu_Category');
const Dish_SubCategory = require('./models/Dish_SubCategory');
const Notice =  require('./models/Notice');
const Client_Raffle = require('./models/Client_Raffle');
const Raffle = require('./models/Raffle');


const app = express();

// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:3000', // Cambia esto por el dominio de tu frontend
    credentials: true, // Para permitir el envío de cookies
  }));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rutas
app.use('/auth', authRoutes);    // Configura las rutas de autenticación JWT
app.use('/oauth', oauthRoutes);  // Configura las rutas de autenticación OAuth

// Sincronización de la base de datos
const syncDatabase = async () => {
    try {
        await sequelize.sync(); // 'force: true' elimina las tablas existentes y las vuelve a crear
        console.log('Base de datos sincronizada');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
};

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
// Inicia el servidor y sincroniza la base de datos
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
    syncDatabase();
});
