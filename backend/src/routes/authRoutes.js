const express = require('express');
const authController = require('../controllers/authController');

//Creamos un enrutador de Express
const router = express.Router();

// Definimos que cuando llegue una petición POST a la raíz de este enrutador (que será /login),
// se ejecute la función login de nuestro controlador.
router.post('/login', authController.login);

module.exports = router;