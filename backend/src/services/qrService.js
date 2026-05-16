const db = require('../config/conexion_db');

/**
 * Obtiene los códigos QR de visitantes cuya expiración es hoy y se encuentran 
 * vencidos o próximos a vencer (en un rango menor o igual a 10 minutos).
 */
const obtenerAlertasVencimiento = async () => {
    // Esta consulta calcula la diferencia en minutos entre la fecha actual y la fecha de expiración
    const sql = `
        SELECT 
            q.id_qr,
            CONCAT(p.nombres, ' ', p.apellidos) AS nombre_visitante,
            DATE_FORMAT(q.fecha_expiracion, '%H:%i') AS hora_expiracion,
            TIMESTAMPDIFF(MINUTE, NOW(), q.fecha_expiracion) AS minutos_restantes
        FROM qr_control q
        INNER JOIN personas p ON q.id_persona = p.id_persona
        WHERE 
            p.tipo_persona = 4 -- 4 significa 'visitante' en tu tabla tipo_persona
            AND DATE(q.fecha_creacion) = CURDATE() -- Solo los de hoy
            AND TIMESTAMPDIFF(MINUTE, NOW(), q.fecha_expiracion) <= 10 -- Menos de 10 minutos para vencer o ya vencidos
        ORDER BY q.fecha_expiracion ASC;
    `;

    const [filas] = await db.execute(sql);
    return filas;
};

module.exports = {
    obtenerAlertasVencimiento
};