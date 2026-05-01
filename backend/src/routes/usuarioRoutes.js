const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { protegerRuta, restringirA } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protegerRuta);

//RUTA PROTEGIDA: Crear nuevos usuarios
//restringirA(1) significa que SOLO el rol 1 (Administrador) tiene permiso para pasar
router.post('/crear', restringirA(1), usuarioController.crearUsuarioInterno);

module.exports = router;