const express = require('express');
const fichaController = require('../controllers/fichaController');

const router = express.Router();

// ==========================================
// RUTAS DE GESTIÓN DE FICHAS
// ==========================================

router.post('/', fichaController.crearFicha);
router.get('/', fichaController.listarFichas);

// NUEVOS ENDPOINTS DINÁMICOS (usan el parámetro :id)
router.put('/:id', fichaController.editarFicha);
router.delete('/:id', fichaController.eliminarFicha);

module.exports = router;