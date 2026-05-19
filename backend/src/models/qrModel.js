const db = require('../config/conexion_db');

const qrModel = {
  // Nueva función: Busca cruzando las tablas por el número de documento
  async buscarQrPorDocumento(numero_documento) {
    const sql = `
      SELECT 
        p.id_persona, 
        p.numero_documento, 
        p.nombres, 
        p.apellidos, 
        p.tipo_estado AS estado_persona,
        tp.nombre_tipo AS tipo_persona_texto,
        q.id_qr,
        q.estado AS estado_qr,
        q.fecha_expiracion
      FROM personas p
      JOIN tipo_persona tp ON p.tipo_persona = tp.tipo_persona
      -- Usamos LEFT JOIN por si la persona existe pero aún no tiene QR asignado
      LEFT JOIN qr_control q ON p.id_persona = q.id_persona
      WHERE p.numero_documento = ?
    `;
    
    // Ejecutamos la consulta pasándole el número de documento
    const [filas] = await db.execute(sql, [numero_documento]);
    
    // Retornamos el primer resultado (o undefined si no encontró nada)
    return filas[0];
  }
};

/**
 * Cambia el estado de un código QR en la base de datos (ej. de 'activo' a 'expirado')
 */
const cambiarEstadoQr = async (id_qr, nuevoEstado) => {
  try {
    // Explicación: Hacemos un UPDATE directo a la tabla qr_control usando el id_qr
    // Los signos de interrogación (?) evitan ataques de inyección SQL (Seguridad)
    const sql = `UPDATE qr_control SET estado = ? WHERE id_qr = ?`;
    
    // Ejecutamos la consulta pasándole el texto del estado y el ID
    const [resultado] = await db.execute(sql, [nuevoEstado, id_qr]);
    
    // Devolvemos true si se modificó al menos una fila
    return resultado.affectedRows > 0;
  } catch (error) {
    console.error("Error en cambiarEstadoQr:", error);
    throw error;
  }
};

module.exports = { ...qrModel, cambiarEstadoQr };