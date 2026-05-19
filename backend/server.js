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

/**
 * TAREA EN SEGUNDO PLANO: Limpiador de visitantes
 * Esta función escanea la base de datos silenciosamente buscando infractores de tiempo.
 */
const limpiarVisitantesVencidos = async () => {
  try {
    // Explicación de la consulta SQL:
    // UPDATE a dos tablas al mismo tiempo (qr_control y personas).
    // ¿A quiénes? A los que sean visitantes (tipo_persona = 4), que sigan activos, 
    // y cuya fecha de expiración sea menor a la hora actual del servidor (NOW()).
    const sql = `
      UPDATE qr_control q
      INNER JOIN personas p ON q.id_persona = p.id_persona
      SET q.estado = 'expirado', p.tipo_estado = 2
      WHERE q.estado = 'activo' 
        AND p.tipo_persona = 4 
        AND NOW() > q.fecha_expiracion;
    `;

    const [resultado] = await pool.execute(sql);

    // Si MySQL modificó al menos 1 fila, lo imprimimos en la consola del backend
    if (resultado.affectedRows > 0) {
      console.log(`[Seguridad] Se expiraron automáticamente ${resultado.affectedRows / 2} visitantes por límite de tiempo.`);
    }
  } catch (error) {
    console.error("Error ejecutando limpieza de visitantes:", error);
  }
};

// setInterval es un bucle infinito en Node.js.
// 300000 milisegundos = 5 minutos.
// El servidor ejecutará la limpieza cada 5 minutos sin que nadie se lo pida.
setInterval(limpiarVisitantesVencidos, 300000);