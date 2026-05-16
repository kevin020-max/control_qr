// src/controllers/qrController.js
const qrService = require('../services/qrService');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');

/**
 * Controlador para enviar las alertas de QRs expirados o por expirar
 */
const getAlertasVencimiento = catchAsync(async (req, res, next) => {
    // Llamamos al motor de base de datos
    const alertas = await qrService.obtenerAlertasVencimiento();

    // Enviamos la respuesta estructurada tal como la lee tu useEffect en React
    res.status(200).json({
        status: 'success',
        data: alertas
    });
});

module.exports = {
    getAlertasVencimiento
};