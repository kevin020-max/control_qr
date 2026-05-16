// src/routes/qrRoutes.js
const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
// Aquí puedes importar tu middleware de autenticación si quieres proteger la ruta
// const { protegerRuta } = require('../middlewares/authMiddleware');

// Definimos la sub-ruta. Recuerda que el prefijo '/qr' se lo da el archivo principal app.js
router.get('/alertas-vencimiento', qrController.getAlertasVencimiento);

module.exports = router;