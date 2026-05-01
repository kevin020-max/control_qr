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
  // 1. Obtener el token de los headers (Ya lo debes tener programado)
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('No has iniciado sesión. Por favor inicia sesión para obtener acceso.', 401));
  }

  // 2. Verificar si el token es válido y extraer lo que guardamos en él (ej: el id_usuario o numero_documento)
  const decodificado = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. LA CLAVE DEL ÉXITO: Buscar al usuario COMPLETO en la base de datos
  // IMPORTANTE: Asegúrate de que estás buscando por el dato correcto que guardaste en el token.
  // Si tu token guarda el numero_documento, cambia la consulta a WHERE numero_documento = ?
  const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?'; 
  const [usuarios] = await db.execute(sql, [decodificado.id]);

  if (usuarios.length === 0) {
    return next(new AppError('El usuario que pertenece a este token ya no existe.', 401));
  }

  const usuario = usuarios[0];

  // 4. El Candado de Soft Delete (Que agregamos antes)
  if (usuario.estado === 2) {
    return next(new AppError('Tu cuenta ha sido desactivada por un administrador. Acceso denegado.', 401));
  }

  // 5. LA INYECCIÓN MÁGICA
  // Aquí le inyectamos a la petición TODOS los datos de la base de datos (incluyendo id_rol).
  // Así, cuando pase al siguiente middleware (restringirA), tendrá la información completa.
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
    // 3. Evaluamos estrictamente
    if (!rolesPermitidos.includes(req.usuario.id_rol)) {
      return next(new AppError('No tienes permiso para realizar esta acción.', 403));
    }

    //Si tiene permiso continuamos
    next();
  };
};

module.exports = {
  protegerRuta,
  restringirA
};