const express = require('express');
const visitanteController = require('../controllers/visitanteController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * RUTA: POST /api/visitantes/registrar
 * Protegida: Solo Operadores (2) y Administradores (1) pueden usarla
 */
router.post(
  '/registrar',
  authMiddleware.protegerRuta,
  authMiddleware.restringirA(1, 2),
  visitanteController.registrarVisitante
);

module.exports = router;