const cargaService = require('../services/cargaService');
const fs = require('fs');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');

// Controlador que maneja la subida del archivo Excel
const subirArchivo = catchAsync(async (req, res, next) => {
    // Validar que multer haya capturado un archivo
    if (!req.file) {
        return next(new AppError('No se envió ningún archivo Excel.', 400));
    }

    const filePath = req.file.path;
    const tipo_persona = req.body.tipo_persona; // Mejor sacarlo del body del form-data
    const id_ficha = req.body.id_ficha || null;

    try {
        // Procesar el archivo con el nuevo servicio
        const resultado = await cargaService.procesarExcel(filePath, tipo_persona, id_ficha);

        // Eliminar el archivo temporal del servidor para no llenar el disco duro
        fs.unlinkSync(filePath);

        res.status(200).json({
            status: 'success',
            data: resultado
        });
    } catch (error) {
        // Si el archivo falla, igual debemos borrarlo de la carpeta temp
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return next(new AppError(`Error procesando el Excel: ${error.message}`, 500));
    }
});

module.exports = {
    subirArchivo
};