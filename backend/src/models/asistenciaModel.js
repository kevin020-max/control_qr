const db = require('../config/conexion_db');

const obtenerAsistenciaPorFichaYFecha = async (id_ficha, fecha) => {

    const sql = `
        SELECT
            p.id_persona,
            p.numero_documento,
            p.nombres,
            p.apellidos,
            c.fecha_entrada,
            c.fecha_salida
        FROM personas p

        LEFT JOIN control_acceso c
            ON p.id_persona = c.id_persona
            AND DATE(c.fecha_entrada) = ?

        WHERE p.tipo_persona = 1
        AND p.tipo_estado = 1
        AND p.id_ficha = ?

        ORDER BY p.apellidos, p.nombres
    `;

    const [rows] = await db.execute(
        sql,
        [fecha, id_ficha]
    );

    return rows;
};

module.exports = {
    obtenerAsistenciaPorFichaYFecha
};