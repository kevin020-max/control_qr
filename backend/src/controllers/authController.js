const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const { loginSchema } = require('../validators/authValidator');
const usuarioModel = require('../models/usuarioModel');
const db = require('../config/conexion_db'); // Pool de conexión

/**
 * Función Ayudante para crear el Token
 */
const firmarToken = (id_usuario, id_rol) => {
  return jwt.sign({ id: id_usuario, id_rol: id_rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Controlador para el Inicio de Sesión (Login) - ACTUALIZADO CON INNER JOIN DE PERSONAS
 */
const login = catchAsync(async (req, res, next) => {
  // Validaciones con zod
  const datosValidados = loginSchema.parse(req.body);
  const { numero_documento, contrasena } = datosValidados;

  // NUEVO: Consulta optimizada para traer los datos de Usuario, su Rol Y sus Nombres/Apellidos
  const sql = `
    SELECT 
      u.id_usuario,
      u.numero_documento,
      u.contrasenia,
      u.estado,
      u.id_rol,
      p.nombres,
      p.apellidos,
      r.nombre_rol
    FROM usuarios u
    INNER JOIN personas p ON u.numero_documento = p.numero_documento
    INNER JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.numero_documento = ?
  `;

  const [rows] = await db.execute(sql, [numero_documento]);
  const usuarioEncontrado = rows[0];

  if (!usuarioEncontrado) {
    return next(new AppError('Número de documento o contraseña incorrectos', httpStatus.UNAUTHORIZED));
  }

  // Comparar contraseñas
  const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasenia);

  if (!contrasenaValida) {
    return next(new AppError('Número de documento o contraseña incorrectos', httpStatus.UNAUTHORIZED));
  }

  // estado 2 significa desactivado, estado 1 significa activo.
  if (usuarioEncontrado.estado === 2) {
    return next(new AppError('Tu cuenta ha sido desactivada. Comunícate con el administrador del sistema.', 403));
  }

  // Generar el token JWT
  const token = firmarToken(usuarioEncontrado.id_usuario, usuarioEncontrado.id_rol);

  // Borramos la contraseña antes de enviar la respuesta por seguridad
  usuarioEncontrado.contrasenia = undefined;

  // Respuesta exitosa (Ahora data.usuario incluirá .nombres y .apellidos reales)
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