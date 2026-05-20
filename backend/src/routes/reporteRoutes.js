// src/routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// Definimos que la sub-ruta '/' (que se sumará al prefijo) responderá al método GET
router.get('/descargar-hoy', reporteController.descargarReporteHoy);

module.exports = router;