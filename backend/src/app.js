// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Importamos nuestro manejador de errores personalizado que creamos antes
const AppError = require('./errors/AppError'); 
const httpStatus = require('./constants/httpStatus');
const authRoutes = require('./routes/authRoutes');

// Inicializamos la aplicación de Express
const app = express();

// 1. MIDDLEWARES GLOBALES (Filtros por los que pasa toda petición)

// Helmet protege nuestra app configurando cabeceras HTTP de seguridad ocultando que usamos Express
app.use(helmet()); 

// Morgan nos permite ver en la consola las peticiones que hace React (ej: "GET /api/usuarios 200")
app.use(morgan('dev')); 

// Configuramos CORS para permitir que React (que está en otro puerto) pueda consumir nuestra API
app.use(cors({
  origin: '*', // En producción, aquí pondremos la URL exacta de tu React (ej: 'https://mi-dominio.com')
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Este middleware es VITAL para React: permite que el backend entienda el JSON que le envía Axios
app.use(express.json()); 

// 2. RUTAS (Aquí conectaremos nuestros controladores más adelante)
app.get('/api/saludo', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: '¡Hola React! El backend está funcionando perfectamente'
  });
});

app.use('/api/auth', authRoutes);

// 3. MANEJO DE RUTAS NO ENCONTRADAS (Si React pide una URL que no existe)
// Cambiamos app.all('*') por app.use() para compatibilidad con Express 5
app.use((req, res, next) => {
  // Usamos nuestra clase AppError para generar el error y pasarlo al middleware global
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor`, httpStatus.NOT_FOUND));
});

// 4. MIDDLEWARE GLOBAL DE ERRORES (Atrapa todos los errores del sistema)
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Siempre respondemos en JSON para que React pueda leer el mensaje de error y mostrarlo bonito en pantalla
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

// Exportamos la app configurada
module.exports = app;