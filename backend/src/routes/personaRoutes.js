const express = require('express');
const personaController = require('../controllers/personaController');
const { validarPersona } = require('../validators/personaValidator');

const router = express.Router();

// ==========================================
// RUTAS DE CREACIÓN INDIVIDUAL DE PERSONAS
// ==========================================

// El middleware validarPersona actúa de escudo antes de llegar al controlador
router.post('/', validarPersona, personaController.crearPersona);

module.exports = router;