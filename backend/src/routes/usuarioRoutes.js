const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(express.json());

// El middleware protegerRuta verifica el Token.
// El middleware restringirA(1) verifica que sea el Administrador.
router.use(authMiddleware.protegerRuta);
router.use(authMiddleware.restringirA(1));

router.post('/crear', usuarioController.crearUsuarioInterno);

router.get('/', usuarioController.obtenerUsuarios);

router.put('/:id/rol', usuarioController.actualizarRolUsuario);

router.put('/:id/estado', usuarioController.cambiarEstadoUsuario);

module.exports = router;