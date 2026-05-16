// src/services/controlAcceso.service.js
const db = require('../config/conexion_db');

/**
 * Obtiene todos los registros de entrada y salida del día actual
 * vinculando los nombres, el tipo de rol y la ficha si aplica.
 */
const obtenerAccesosDelDia = async () => {
    try {
        // Asegúrate de que los nombres de las tablas coincidan con tu script SQL real
        const sql = `
            SELECT 
            a.id_control,
            p.numero_documento,
            p.nombres,
            p.apellidos,
            tp.nombre_tipo AS nombre_tipo,  -- Nombre de columna real en tu script
            f.numero_ficha,
            a.fecha_entrada,
            a.fecha_salida
        FROM control_acceso a
        INNER JOIN personas p ON a.id_persona = p.id_persona
        INNER JOIN tipo_persona tp ON p.tipo_persona = tp.tipo_persona -- CORRECCIÓN: llave primaria correcta
        LEFT JOIN ficha f ON p.id_ficha = f.id_ficha                  -- CORRECCIÓN: la tabla se llama 'ficha' (singular)
        WHERE DATE(a.fecha_entrada) = CURDATE()
        ORDER BY a.fecha_entrada DESC;
        `;

        const [filas] = await db.execute(sql);
        return filas;
    } catch (error) {
        // Esto te mostrará el error exacto de MySQL en la consola del backend en lugar de solo el 500
        console.error("❌ Error en la consulta SQL de accesos diarios:", error.message);
        throw error; 
    }
};

module.exports = {
    obtenerAccesosDelDia
};