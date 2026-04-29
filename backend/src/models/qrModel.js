const db = require('../config/conexion_db');

/**
 * Busca un QR por su ID y trae los datos de la persona asociada.
 */

const buscarQrPorId = async (idQr) => {
  // Usamos una consulta SQL con un 'JOIN' para unir dos tablas: qr_control y personas.
  // Esto es mucho más rápido y escalable que hacer dos consultas separadas.
  // El signo de interrogación (?) nos protege de la inyección SQL.
  const consultaSql = `
    SELECT
      qr.id_qr,
      qr.estado AS estado_qr,
      qr.fecha_expiracion,
      p.id_persona,
      p.nombres,
      p.apellidos,
      p.tipo_estado AS estado_persona,
      p.tipo_persona
    FROM qr_control qr
    JOIN personas p ON qr.id_persona = p.id_persona
    WHERE qr.id_qr = ?
  `;

  // Ejecutamos la consulta pasándole el idQr para reemplazar el '?'
  const [filas] = await db.query(consultaSql, [idQr]);

  // Retornamos el primer resultado (ya que un ID de QR es único)
  // Si no existe, retornará undefined
  return filas[0];
};

module.exports = {
  buscarQrPorId
};