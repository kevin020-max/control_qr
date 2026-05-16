const express = require('express');
const controlAccesoController = require('../controllers/controlAccesoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * RUTA: POST /api/accesos/escanear
 * * Aplicamos la seguridad en orden:
 * 1. protegerRuta: Verifica que el operario haya iniciado sesión (tenga un token válido).
 * 2. restringirA(1, 2): Solo permite el paso si el usuario es Admin (1) u Operario (2).
 * 3. escanearQr: Si pasa los filtros, se ejecuta la lógica del controlador.
 */

router.post(
  '/escanear',
  authMiddleware.protegerRuta,
  authMiddleware.restringirA(1, 2), // Solo Admin y Operario pueden acceder
  controlAccesoController.escanearQr
);

// Definimos el sub-path que responderá a la petición de la tabla
router.get('/hoy', controlAccesoController.getAccesosHoy);

module.exports = router;