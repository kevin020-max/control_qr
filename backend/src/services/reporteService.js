const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../config/conexion_db');

/**
 * Genera un archivo PDF con las estadísticas generales de ingresos de hoy
 */
const generarPdfIngresosHoy = async (outputPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Consultas rápidas a MySQL para las estadísticas del encabezado
            const [ingresos] = await pool.query("SELECT COUNT(*) as total FROM control_acceso WHERE DATE(fecha_entrada) = CURDATE()");
            const [visitantes] = await pool.query(`
                SELECT COUNT(*) as total FROM control_acceso c 
                INNER JOIN personas p ON c.id_persona = p.id_persona 
                WHERE DATE(c.fecha_entrada) = CURDATE() AND p.tipo_persona = 4
            `);

            // 2. Crear el lienzo del PDF
            const doc = new PDFDocument({ margin: 40 });
            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            // --- DISEÑO: ENCABEZADO CORPORATIVO ---
            doc.rect(0, 0, doc.page.width, 100).fill('#39A900'); // Franja Verde SENA
            doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('SENA - CONTROL DE ACCESO', 40, 25);
            doc.fontSize(12).font('Helvetica').text(`Reporte Operativo Diario - Centro de Formación`, 40, 55);
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 40, 72, { align: 'right' });

            doc.moveDown(4);
            doc.fillColor('#333333');

            // --- DISEÑO: TARJETAS DE RESUMEN ---
            doc.fontSize(16).font('Helvetica-Bold').text('Resumen General de Operaciones', 40, 130);
            doc.rect(40, 155, 240, 60).lineWidth(1).stroke('#e6e6e6');
            doc.fontSize(11).font('Helvetica').fillColor('#878787').text('TOTAL INGRESOS HOY', 55, 165);
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#39A900').text(`${ingresos[0].total}`, 55, 185);

            doc.rect(300, 155, 240, 60).lineWidth(1).stroke('#e6e6e6');
            doc.fontSize(11).font('Helvetica').fillColor('#878787').text('VISITANTES TEMPORALES', 315, 165);
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#ff9800').text(`${visitantes[0].total}`, 315, 185);

            // --- DISEÑO: TABLA DE DETALLES ---
            doc.fillColor('#333333').fontSize(14).font('Helvetica-Bold').text('Detalle de Movimientos Recientes', 40, 250);
            
            // Dibujar encabezado de tabla
            let y = 280;
            doc.rect(40, y, 500, 25).fill('#f5f5f5');
            doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold');
            doc.text('Documento', 50, y + 8);
            doc.text('Nombre Completo', 160, y + 8);
            doc.text('Hora Entrada', 380, y + 8);
            doc.text('Hora Salida', 460, y + 8);

            // Traer registros de la BD
            const [registros] = await pool.query(`
                SELECT p.numero_documento, p.nombres, p.apellidos, c.fecha_entrada, c.fecha_salida 
                FROM control_acceso c
                INNER JOIN personas p ON c.id_persona = p.id_persona
                WHERE DATE(c.fecha_entrada) = CURDATE() ORDER BY c.fecha_entrada DESC LIMIT 10
            `);

            doc.font('Helvetica').fontSize(10);
            registros.forEach((reg) => {
                y += 25;
                // Línea divisoria suave
                doc.moveTo(40, y + 20).lineTo(540, y + 20).stroke('#eee');
                
                doc.text(reg.numero_documento.toString(), 50, y + 6);
                doc.text(`${reg.nombres} ${reg.apellidos}`, 160, y + 6);
                doc.text(new Date(reg.fecha_entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 380, y + 6);
                doc.text(reg.fecha_salida ? new Date(reg.fecha_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--', 460, y + 6);
            });

            // Finalizar el render del PDF
            doc.end();

            writeStream.on('finish', () => resolve(outputPath));
            writeStream.on('error', (err) => reject(err));

        } catch (error) {
            reject(error);
        }
    });
};

const obtenerEstadisticas = async (
    periodo = 'semana',
    tipoPersona = 'general'
) => {

    let filtroFecha = `
        DATE_SUB(
            CURDATE(),
            INTERVAL 7 DAY
        )
    `;

    if (periodo === 'mes') {

        filtroFecha = `
            DATE_SUB(
                CURDATE(),
                INTERVAL 1 MONTH
            )
        `;
    }

    if (periodo === 'trimestre') {

        filtroFecha = `
            DATE_SUB(
                CURDATE(),
                INTERVAL 3 MONTH
            )
        `;
    }

    let filtroTipo = '';

    if (tipoPersona === 'aprendiz') {

        filtroTipo =
            'AND p.tipo_persona = 1';
    }

    if (tipoPersona === 'visitante') {

        filtroTipo =
            'AND p.tipo_persona = 4';
    }

    const [[totalActivos]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM personas p
            WHERE p.tipo_estado = 1
            ${filtroTipo}
        `);

    const [[ingresos]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE c.fecha_entrada >=
            ${filtroFecha}
            ${filtroTipo}
        `);

    const [[salidas]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE c.fecha_salida IS NOT NULL
            AND c.fecha_salida >=
            ${filtroFecha}
            ${filtroTipo}
        `);

    const [[promedioDiario]] =
        await pool.query(`
            SELECT ROUND(
                COUNT(*) / 30
            ) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE c.fecha_entrada >=
            ${filtroFecha}
            ${filtroTipo}
        `);

    const [[aprendicesHoy]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE DATE(c.fecha_entrada)
                = CURDATE()
            AND p.tipo_persona = 1
        `);

    const [[instructoresHoy]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE DATE(c.fecha_entrada)
                = CURDATE()
            AND p.tipo_persona = 2
        `);

    const [[funcionariosHoy]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE DATE(c.fecha_entrada)
                = CURDATE()
            AND p.tipo_persona = 3
        `);

    const [[visitantesHoy]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM control_acceso c
            INNER JOIN personas p
                ON p.id_persona =
                c.id_persona
            WHERE DATE(c.fecha_entrada)
                = CURDATE()
            AND p.tipo_persona = 4
        `);

    return {

        totalActivos:
            totalActivos.total,

        ingresosTrimestre:
            ingresos.total,

        salidasTrimestre:
            salidas.total,

        promedioDiario:
            promedioDiario.total,

        resumenHoy: {

            aprendices:
                aprendicesHoy.total,

            instructores:
                instructoresHoy.total,

            funcionarios:
                funcionariosHoy.total,

            visitantes:
                visitantesHoy.total
        }
    };
};

module.exports = {
    generarPdfIngresosHoy,
    obtenerEstadisticas
};