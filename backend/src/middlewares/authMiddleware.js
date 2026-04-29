const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Convierte funciones antiguas basadas en callbacks a Promesas modernas
const AppError = require('../errors/AppError');
const catchAsync = require('../errors/catchAsync');
const httpStatus = require('../constants/httpStatus');

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

  // 3. Si el token es válido, guardamos los datos del usuario en la petición (req)
  // Recuerda que en nuestro authController guardamos id_usuario e id_rol dentro del token.
  req.usuario = decodificado;

  // 4. Todo está en orden, le decimos a Express que continúe hacia el controlador
  next();
});

/**
 * Middleware 2: Restringir el acceso según el Rol del usuario
 * Esta función recibe una lista de roles permitidos (ej. 1 para Admin, 2 para Operario)
 */
const restringirA = (...rolesPermitidos) => {
  // Retornamos la función middleware real
  return (req, res, next) => {
    // req.usuario.id_rol viene del middleware 'protegerRuta' que se ejecutó justo antes
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