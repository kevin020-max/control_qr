const PDFDocument = require('pdfkit');
const fs = require('fs');
const pool = require('../config/conexion_db');

const generarPdfAsistencia = async (
    outputPath,
    idFicha,
    fecha
) => {

    return new Promise(async (resolve, reject) => {

        try {

            const [fichaInfo] = await pool.query(
                `
                SELECT
                    numero_ficha,
                    nombre
                FROM ficha
                WHERE id_ficha = ?
                `,
                [idFicha]
            );

            const [aprendices] = await pool.query(
                `
                SELECT
                    p.numero_documento,
                    p.nombres,
                    p.apellidos,
                    c.fecha_entrada,
                    c.fecha_salida
                FROM personas p

                LEFT JOIN control_acceso c
                    ON p.id_persona = c.id_persona
                    AND DATE(c.fecha_entrada) = ?

                WHERE p.id_ficha = ?
                AND p.tipo_persona = 1
                AND p.tipo_estado = 1

                ORDER BY p.apellidos, p.nombres
                `,
                [fecha, idFicha]
            );

            const totalAprendices =
                aprendices.length;

            const presentes =
                aprendices.filter(
                    a => a.fecha_entrada
                ).length;

            const ausentes =
                totalAprendices - presentes;

            const doc =
                new PDFDocument({
                    margin: 40
                });

            const writeStream =
                fs.createWriteStream(outputPath);

            doc.pipe(writeStream);

            doc.rect(
                0,
                0,
                doc.page.width,
                90
            ).fill('#39A900');

            doc
                .fillColor('#FFFFFF')
                .fontSize(22)
                .font('Helvetica-Bold')
                .text(
                    'REPORTE DE ASISTENCIA',
                    40,
                    30
                );

            doc
                .fontSize(11)
                .font('Helvetica')
                .text(
                    `Fecha consulta: ${new Date(fecha).toLocaleDateString('es-CO')}`,
                    40,
                    60
                );

            doc.moveDown(4);

            doc.fillColor('#333333');

            doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .text(
                    `Ficha: ${fichaInfo[0]?.numero_ficha || ''} - ${fichaInfo[0]?.nombre || ''}`,
                    40,
                    120
                );

            doc.rect(40, 160, 150, 60).stroke('#e5e7eb');

            doc
                .fontSize(10)
                .fillColor('#6b7280')
                .text(
                    'TOTAL APRENDICES',
                    55,
                    175
                );

            doc
                .fontSize(20)
                .fillColor('#39A900')
                .text(
                    totalAprendices.toString(),
                    55,
                    190
                );

                        doc.rect(220, 160, 150, 60).stroke('#e5e7eb');

            doc
                .fontSize(10)
                .fillColor('#6b7280')
                .text(
                    'PRESENTES',
                    235,
                    175
                );

            doc
                .fontSize(20)
                .fillColor('#39A900')
                .text(
                    presentes.toString(),
                    235,
                    190
                );

            doc.rect(400, 160, 150, 60).stroke('#e5e7eb');

            doc
                .fontSize(10)
                .fillColor('#6b7280')
                .text(
                    'AUSENTES',
                    415,
                    175
                );

            doc
                .fontSize(20)
                .fillColor('#ef4444')
                .text(
                    ausentes.toString(),
                    415,
                    190
                );

            let y = 270;

            doc
                .fillColor('#111827')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text(
                    'Detalle de Asistencia',
                    40,
                    y
                );

            y += 30;

            doc.rect(
                40,
                y,
                510,
                25
            ).fill('#f3f4f6');

            doc.fillColor('#111827');

            doc.fontSize(9);

            doc.text(
                'Documento',
                45,
                y + 8
            );

            doc.text(
                'Nombre',
                130,
                y + 8
            );

            doc.text(
                'Ingreso',
                320,
                y + 8
            );

            doc.text(
                'Salida',
                390,
                y + 8
            );

            doc.text(
                'Tiempo',
                460,
                y + 8
            );

            doc.text(
                'Estado',
                520,
                y + 8
            );

            y += 30;

                        aprendices.forEach((item) => {

                if (y > 730) {

                    doc.addPage();

                    y = 40;
                }

                const ingreso =
                    item.fecha_entrada
                        ? new Date(
                            item.fecha_entrada
                          ).toLocaleTimeString(
                            'es-CO',
                            {
                                hour: '2-digit',
                                minute: '2-digit'
                            }
                          )
                        : '--';

                const salida =
                    item.fecha_salida
                        ? new Date(
                            item.fecha_salida
                          ).toLocaleTimeString(
                            'es-CO',
                            {
                                hour: '2-digit',
                                minute: '2-digit'
                            }
                          )
                        : '--';

                const estado =
                    item.fecha_entrada
                        ? 'Asistió'
                        : 'Ausente';

                let tiempoTotal = '--';

                if (
                    item.fecha_entrada &&
                    item.fecha_salida
                ) {

                    const diferencia =
                        new Date(item.fecha_salida) -
                        new Date(item.fecha_entrada);

                    const horas =
                        Math.floor(
                            diferencia /
                            (1000 * 60 * 60)
                        );

                    const minutos =
                        Math.floor(
                            (
                                diferencia %
                                (1000 * 60 * 60)
                            ) /
                            (1000 * 60)
                        );

                    tiempoTotal =
                        `${horas}h ${minutos}m`;
                }

                doc.moveTo(
                    40,
                    y + 18
                ).lineTo(
                    550,
                    y + 18
                ).stroke('#eeeeee');

                doc.fillColor('#111827');

                doc.text(
                    item.numero_documento.toString(),
                    45,
                    y
                );

                doc.text(
                    `${item.nombres} ${item.apellidos}`,
                    130,
                    y,
                    {
                        width: 180
                    }
                );

                doc.text(
                    ingreso,
                    320,
                    y
                );

                doc.text(
                    salida,
                    390,
                    y
                );

                doc.text(
                    tiempoTotal,
                    460,
                    y
                );

                doc.text(
                    estado,
                    520,
                    y
                );

                y += 25;
            });

            doc.end();

            writeStream.on(
                'finish',
                () => resolve(outputPath)
            );

            writeStream.on(
                'error',
                (err) => reject(err)
            );

        } catch (error) {

            reject(error);
        }
    });
};

module.exports = {
    generarPdfAsistencia
};