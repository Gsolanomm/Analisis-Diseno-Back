// server.js
const express = require('express');
const sequelize = require('./db'); // Asegúrate de que la ruta sea correcta
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport'); // Importa la configuración de Passport
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/auth');    // Importa el archivo auth.js
const oauthRoutes = require('./routes/oauth');  // Importa el archivo oauth.js
const adminRoutes = require('./routes/admin');  // Importa el archivo admin.js
const categoryRoutes = require('./routes/Category'); // Importa las rutas de categoría
const subcategoryRouter = require('./routes/subcategory'); // Importa el router de subcategorías
const salesRoutes = require('./routes/sales'); // Importa las rutas de ventas
const tablesRoutes = require('./routes/Tables'); // Importa las rutas de mesas
const dishRoutes = require('./routes/Dish'); // Importa las rutas de platos
const NotificationRoutes = require('./routes/Notifications'); // Importa las rutas de notificaciones
const notice = require('./routes/notices'); // Importa las rutas de notificaciones
const raffle = require('./routes/raffle'); // Importa las rutas de sorteos
const recipe = require('./routes/Recipe'); // Importa las rutas de recetas
const review = require('./routes/Review'); // Importa las rutas de reseñas
const menu = require('./routes/menuRoutes'); // Importa las rutas de menús
const reservation = require('./routes/Reservation'); // Importa las rutas de reservaciones


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
const sales = require('./models/Sales');
const Tables = require('./models/Tables');
const Notifications = require('./models/Notification');

const app = express();

// Configura los archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/admin', adminRoutes);  // Configura las rutas de administrador
app.use('/categories', categoryRoutes);
app.use('/subcategories', subcategoryRouter); // Usa el router de subcategorías
app.use('/sales', salesRoutes); // Usa el router de ventas
app.use('/tables', tablesRoutes); // Usa el router de mesas
app.use('/dish', dishRoutes); // Usa el router de platos
app.use('/notifications', NotificationRoutes); // Configura las rutas de notificaciones
app.use('/notices', notice); // Configura las rutas de notificaciones
app.use('/raffle', raffle); // Configura las rutas de sorteos
app.use('/recipes', recipe); // Configura las rutas de recetas
app.use('/reviews', review); // Configura las rutas de reseñas
app.use('/menu', menu); // Configura las rutas de menús
app.use('/reservations', reservation); // Configura las rutas de reservaciones


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
