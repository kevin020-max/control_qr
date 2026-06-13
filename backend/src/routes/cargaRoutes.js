const express = require('express');
const multer = require('multer');
const cargaController = require('../controllers/cargaController');

const router = express.Router();

// Configuración de multer (subida de archivos a la carpeta temporal 'uploads')
const upload = multer({ dest: 'uploads/' });

// ==========================================
// RUTAS DE CARGA MASIVA
// ==========================================

// Aprendices
router.post('/aprendices', upload.single('archivo'), (req, res, next) => {
    // Inyectamos el tipo de persona en el body para que el controlador lo lea automáticamente
    req.body.tipo_persona = 1; 
    next();
}, cargaController.subirArchivo);

// Instructores
router.post('/instructores', upload.single('archivo'), (req, res, next) => {
    req.body.tipo_persona = 2; 
    next();
}, cargaController.subirArchivo);

// Funcionarios
router.post('/funcionarios', upload.single('archivo'), (req, res, next) => {
    req.body.tipo_persona = 3; 
    next();
}, cargaController.subirArchivo);

module.exports = router;