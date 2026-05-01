const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const { loginSchema } = require('../validators/authValidator');
const usuarioModel = require('../models/usuarioModel');
const db = require('../config/conexion_db');

/**
 * Función Ayudante para crear el Token
 */
const firmarToken = (id_usuario, id_rol) => {
  //Usamos 'id' en lugar de 'id_usuario' para que coincida exactamente con nuestro authMiddleware
  return jwt.sign({ id: id_usuario, id_rol: id_rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Controlador para el Inicio de Sesión (Login)
 */
const login = catchAsync(async (req, res, next) => {
  //Validaciones con zod
  const datosValidados = loginSchema.parse(req.body);
  const { numero_documento, contrasena } = datosValidados;

  //Buscar el usuario en la BD (El modelo debe hacer JOIN con 'roles' para traer 'nombre_rol')
  const usuarioEncontrado = await usuarioModel.buscarPorDocumento(numero_documento);

  if (!usuarioEncontrado) {
    return next(new AppError('Número de documento o contraseña incorrectos', httpStatus.UNAUTHORIZED));
  }

  //Comparar contraseñas
  const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasenia);

  if (!contrasenaValida) {
    return next(new AppError('Número de documento o contraseña incorrectos', httpStatus.UNAUTHORIZED));
  }

    // estado 2 significa desactivado, estado 1 significa activo.
    if (usuarioEncontrado.estado === 2) {
      // Retornamos un error 403 (Forbidden / Prohibido)
      return next(new AppError('Tu cuenta ha sido desactivada. Comunícate con el administrador del sistema.', 403));
    }

  //Generar el token JWT
  const token = firmarToken(usuarioEncontrado.id_usuario, usuarioEncontrado.id_rol)

  //Borramos la contraseña antes de enviar la respuesta
  usuarioEncontrado.contrasenia = undefined;

  //Respuesta exitosa
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Inicio de sesión exitoso',
    token,
    data: {
      usuario: usuarioEncontrado
    }
  });
});

module.exports = {
  login
};