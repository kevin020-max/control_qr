// src/constants/httpStatus.js

// Exportamos un objeto con los códigos HTTP más comunes que usaremos en las respuestas
module.exports = {
  OK: 200,                    // Todo salió bien (ej: consultas exitosas)
  CREATED: 201,               // Se creó un registro exitosamente (ej: nuevo visitante)
  BAD_REQUEST: 400,           // El cliente envió datos mal formateados (ej: email inválido)
  UNAUTHORIZED: 401,          // El usuario no ha iniciado sesión o el token expiró
  FORBIDDEN: 403,             // El usuario inició sesión pero no tiene permiso para esta acción
  NOT_FOUND: 404,             // El recurso no existe (ej: aprendiz no encontrado)
  INTERNAL_SERVER_ERROR: 500  // Error grave en nuestro servidor o base de datos
};