// server.js
require('dotenv').config(); // Cargamos nuestras variables de entorno (.env)
const app = require('./src/app'); // Importamos la aplicación que configuramos arriba
const pool = require('./src/config/conexion_db'); // Importamos la conexión a MySQL

const PORT = process.env.PORT || 3000;

// Primero verificamos que la base de datos responda antes de encender el servidor web
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos MySQL exitosa.');
    connection.release(); // Liberamos la conexión de prueba

      // Una vez asegurada la BD, encendemos el servidor para escuchar a React
      app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error fatal: No se pudo conectar a la base de datos MySQL.', err);
    process.exit(1); // Apagamos la app si no hay base de datos, ya que no puede funcionar sin ella
});