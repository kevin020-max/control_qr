const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Convierte funciones antiguas basadas en callbacks a Promesas modernas
const AppError = require('../errors/AppError');
const catchAsync = require('../errors/catchAsync');
const httpStatus = require('../constants/httpStatus');
const db = require('../config/conexion_db');

/**
 * Middleware 1: Verificar que el usuario tenga un Token válido (Haber iniciado sesión)
 */
const protegerRuta = catchAsync(async (req, res, next) => {

  // 1. Obtener el token de las cabeceras de la petición (Headers)
  let token;

  // El estándar web dice que el token se envía en la cabecera 'Authorization' con la palabra 'Bearer ' antes.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Separamos "Bearer" del token real y nos quedamos con el token (posición 1 del arreglo)
    token = req.headers.authorization.split(' ')[1];
  }

  // Si no hay token, bloqueamos el acceso inmediatamente
  if (!token) {
    return next(new AppError('No has iniciado sesion. Por favor, inicia sesion para acceder', httpStatus.UNAUTHORIZED));
  }

  // 2. Verificar si el token es válido y no ha sido alterado
  // Usamos promisify para poder usar 'await' con jwt.verify
  const decodificado = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Dentro de tu función protegerRuta...
  
  console.log('🛑 [DEBUG] MIDDLEWARE: A punto de buscar al usuario del token...');
  // 3. LA DEFENSA SENIOR: Verificamos si el usuario aún existe en MySQL
  // 'decodificado.id' es la variable que guardamos al firmar el token en authController
  const sql = `SELECT * FROM usuarios WHERE id_usuario = ?`;
  const [usuarios] = await db.execute(sql, [decodificado.id]);

  if (usuarios.length === 0) {
    return next(new AppError('El usuario asociado a este token ya no existe.', httpStatus.UNAUTHORIZED));
  }

  const usuario = usuarios[0];

  // 4. Verificamos que el usuario no haya sido inhabilitado (Estado 1 = Activo)
  if (usuario.estado !== 1) {
    return next(new AppError('Tu cuenta ha sido inhabilitada. Contacta al administrador.', httpStatus.UNAUTHORIZED));
  }

  // 5. Todo está perfecto. Guardamos toda la información fresca de la BD en la petición
  req.usuario = usuario;

  next();
});

/**
 * Middleware 2: Restringir el acceso según el Rol del usuario
 * Esta función recibe una lista de roles permitidos (ej. 1 para Admin, 2 para Operario)
 */
const restringirA = (...rolesPermitidos) => {
  // Retornamos la función middleware real
  return (req, res, next) => {
    // Como en protegerRuta le inyectamos toda la fila de la BD a req.usuario,
    // podemos leer la columna 'id_rol' con total seguridad.
    if (!rolesPermitidos.includes(req.usuario.id_rol)) {
      // Si el rol del usuario no está en la lista de permitidos, lanzamos error 403 (Prohibido)
      return next(new AppError('No tienes permiso para realizar esta acción.', httpStatus.FORBIDDEN));
    }

    //Si tiene permiso continuamos
    next();
  };
};

module.exports = {
  protegerRuta,
  restringirA
};