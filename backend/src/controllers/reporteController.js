const reporteService = require('../services/reporteService');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');

const descargarReporteHoy = catchAsync(async (req, res, next) => {

    const nombreArchivo =
        `Reporte_Accesos_${new Date().toISOString().slice(0, 10)}.pdf`;

    const rutaTemporal = path.join(
        __dirname,
        '../../storage/reportes',
        nombreArchivo
    );

    const carpeta = path.dirname(
        rutaTemporal
    );

    if (!fs.existsSync(carpeta)) {

        fs.mkdirSync(
            carpeta,
            {
                recursive: true
            }
        );
    }

    await reporteService.generarPdfIngresosHoy(
        rutaTemporal
    );

    res.download(
        rutaTemporal,
        nombreArchivo,
        (err) => {

            if (err) {

                return next(
                    new AppError(
                        'No se pudo descargar el archivo PDF de la plataforma.',
                        500
                    )
                );
            }

            fs.unlinkSync(
                rutaTemporal
            );
        }
    );
});

const obtenerEstadisticas = catchAsync(
    async (req, res) => {

        const {
            periodo,
            tipoPersona
        } = req.query;

        const estadisticas =
            await reporteService.obtenerEstadisticas(
                periodo,
                tipoPersona
            );

        res.status(200).json({
            status: 'success',
            data: estadisticas
        });
    }
);

module.exports = {
    descargarReporteHoy,
    obtenerEstadisticas
};