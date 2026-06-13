// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Protegemos la ruta para que solo usuarios con sesión iniciada la vean
router.use(protegerRuta);

// GET /api/dashboard/resumen
router.get('/resumen', dashboardController.obtenerResumen);

module.exports = router;