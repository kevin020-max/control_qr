const path = require('path');
const fs = require('fs');

const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');

const asistenciaPdfService =
require('../services/asistenciaPdfService');

const exportarPdf = catchAsync(
    async (req, res, next) => {

        const {
        id_ficha,
        fecha
        } = req.query;

        if (!id_ficha || !fecha) {

        return next(
            new AppError(
            'La ficha y la fecha son obligatorias.',
            400
            )
        );
        }

        const nombreArchivo =
        `Asistencia_${id_ficha}_${fecha}.pdf`;

        const rutaTemporal =
        path.join(
            __dirname,
            '../../storage/asistencia',
            nombreArchivo
        );

        const carpeta =
        path.dirname(rutaTemporal);

        if (!fs.existsSync(carpeta)) {

        fs.mkdirSync(
            carpeta,
            {
            recursive: true
            }
        );
        }

        await asistenciaPdfService.generarPdfAsistencia(
        rutaTemporal,
        id_ficha,
        fecha
        );

        res.download(
        rutaTemporal,
        nombreArchivo,
        (err) => {

            if (err) {

            return next(
                new AppError(
                'No fue posible descargar el PDF.',
                500
                )
            );
            }

            if (
            fs.existsSync(
                rutaTemporal
            )
            ) {

            fs.unlinkSync(
                rutaTemporal
            );
            }
        }
        );
    }
);

module.exports = {
    exportarPdf
};