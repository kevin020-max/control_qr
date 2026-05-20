// src/controllers/reporteController.js
const reporteService = require('../services/reporteService');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');

const descargarReporteHoy = catchAsync(async (req, res, next) => {
    // 1. Definimos un nombre único para el reporte del día
    const nombreArchivo = `Reporte_Accesos_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // 2. Establecemos la ruta temporal donde se guardará en el servidor antes de enviarlo
    const rutaTemporal = path.join(__dirname, '../../storage/reportes', nombreArchivo);

    // Aseguramos de que la carpeta 'storage/reportes' exista en la raíz del proyecto
    const carpeta = path.dirname(rutaTemporal);
    if (!fs.existsSync(carpeta)){
        fs.mkdirSync(carpeta, { recursive: true });
    }

    // 3. Llamamos al servicio (PDFKit) para que dibuje el archivo físico
    await reporteService.generarPdfIngresosHoy(rutaTemporal);

    // 4. LA CLAVE: Enviamos el archivo al navegador del usuario para que se descargue solo
    res.download(rutaTemporal, nombreArchivo, (err) => {
        if (err) {
            return next(new AppError('No se pudo descargar el archivo PDF de la plataforma.', 500));
        }
        
        // OPCIONAL: Borrar el archivo del servidor después de enviarlo para no llenar el disco duro
        fs.unlinkSync(rutaTemporal);
    });
});

module.exports = {
    descargarReporteHoy
};