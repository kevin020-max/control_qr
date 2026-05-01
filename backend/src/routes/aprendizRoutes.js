// src/routes/aprendizRoutes.js
const express = require('express');
const aprendizController = require('../controllers/aprendizController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ============================================================================
// ZONA ULTRA PROTEGIDA (Solo Administradores - Rol 1)
// ============================================================================

// Aplicamos los candados a todas las rutas de este archivo
router.use(authMiddleware.protegerRuta);
router.use(authMiddleware.restringirA(1));

// CREATE: Crear un aprendiz
router.post('/crear', aprendizController.crearAprendiz);

// READ: Obtener todos los aprendices
router.get('/', aprendizController.obtenerAprendices);

// UPDATE: Actualizar datos del aprendiz
router.put('/:id', aprendizController.actualizarAprendiz);

// DELETE: Cambiar estado del aprendiz (1 o 2)
router.put('/:id/estado', aprendizController.cambiarEstadoAprendiz);

module.exports = router;