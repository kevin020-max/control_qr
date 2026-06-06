const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// PDF General
router.get(
    '/descargar-hoy',
    reporteController.descargarReporteHoy
);

// Estadísticas Dashboard Reportes
router.get(
    '/estadisticas',
    reporteController.obtenerEstadisticas
);

module.exports = router;