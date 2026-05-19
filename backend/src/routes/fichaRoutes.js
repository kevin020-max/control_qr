const express = require('express');
const fichaController = require('../controllers/fichaController');

const router = express.Router();

// ==========================================
// RUTAS DE GESTIÓN DE FICHAS
// ==========================================

router.post('/', fichaController.crearFicha);
router.get('/', fichaController.listarFichas);

module.exports = router;