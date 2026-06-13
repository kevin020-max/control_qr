// src/config/conexion_db.js
const mysql = require('mysql2/promise'); // Usamos la versión de promesas para manejar el asincronismo fácilmente
require('dotenv').config(); // Cargamos nuestras variables secretas del archivo .env

// Creamos un "pool" de conexiones. 
// A diferencia de una conexión simple, el pool reutiliza conexiones, lo que hace el sistema mucho más rápido y escalable.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; // Exportamos el pool para poder usarlo en nuestros "models"