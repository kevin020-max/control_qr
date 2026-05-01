const db = require('../config/conexion_db');

/**
 * Busca un usuario en la base de datos por su número de documento.
 * Usamos async/await porque la consulta a la base de datos toma tiempo.
 */
const buscarPorDocumento = async (numeroDocumento) => {
  // Usamos el signo de interrogación (?) para pasar el valor. 
  // Esto es VITAL por seguridad: evita ataques de Inyección SQL.
  const consultaSql = `
    SELECT * FROM usuarios WHERE numero_documento = ?`;

  // db.query devuelve un arreglo. El primer elemento contiene las filas (rows) que encontró.
  // Pasamos [nombreUsuario] en un arreglo para que reemplace el '?' en la consulta de forma segura.
  const [filas] = await db.query(consultaSql, [numeroDocumento]);

  // Como el campo 'usuario' es UNIQUE en la base de datos, solo debería encontrar 1 o ninguno.
  // Retornamos el primer elemento (índice 0). Si no encontró nada, retornará 'undefined'.
  return filas[0];
};

module.exports = {
  buscarPorDocumento
};