// Importamos las librerías de seguridad
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importamos nuestras herramientas personalizadas
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

// Importamos el validador y el modelo
const { loginSchema } = require('../validators/authValidator');
const usuarioModel = require('../models/usuarioModel');

/**
 * Controlador para el Inicio de Sesión (Login)
 * Lo envolvemos en catchAsync para que si algo falla (ej. se cae la base de datos),
 * nuestra app no se apague y envíe el error a nuestro manejador global.
 */
const login = catchAsync(async (req, res, next) => {

  // 1. CREAMOS la variable 'datosValidados' pasando el req.body por nuestro esquema Zod
  const datosValidados = loginSchema.parse(req.body);

  /// 2. Ahora sí podemos extraer el documento y la contraseña de los datos que ya pasaron la validación
  const { numero_documento, contrasena } = datosValidados;

  // 3. Buscamos al usuario en la base de datos usando el modelo que corregimos antes
  const usuarioEncontrado = await usuarioModel.buscarPorDocumento(numero_documento);

  // Si el modelo retorna 'undefined' (no encontró nada), bloqueamos el acceso.
  // Damos un mensaje genérico por seguridad, para que un hacker no sepa si falló el usuario o la clave.
  if (!usuarioEncontrado) {
    return next(new AppError('Usuario o contraseña incorrectos', httpStatus.UNAUTHORIZED));
  }

  //Comparar la contraseña
  // En la base de datos la contraseña está encriptada. bcrypt.compare toma la clave en texto plano
  // (que envió el frontend) y la compara matemáticamente con el hash de la base de datos.
  const contrasenaValida = await bcrypt.compare(datosValidados.contrasena, usuarioEncontrado.contraseña);

  //Si bcrypt dice que no coinciden, bloqueamos el acceso
  if (!contrasenaValida) {
    return next(new AppError('Usuario o contraseña incorrectos', httpStatus.UNAUTHORIZED));
  }

  // 4. Si todo es correcto, generamos el Token JWT (El pase VIP)
  // El "payload" (la carga útil) contiene los datos públicos que queremos guardar en el token.
  const payload = {
    id_usuario: usuarioEncontrado.id_usuario,
    id_rol: usuarioEncontrado.id_rol
  };

  // Firmamos el token con nuestra palabra secreta y le damos un tiempo de expiración (ej. 2h)
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // 5. PROTEGER LA INFORMACIÓN
  // ¡NUNCA enviar contraseñas (ni siquiera encriptadas) en la respuesta JSON hacia React!
  // Borramos esa propiedad del objeto antes de enviarlo.
  usuarioEncontrado.contraseña = undefined;

  // 6. Enviar la respuesta exitosa al cliente (Frontend)
  // Respondemos con un estado 200 (OK) y un objeto JSON limpio.
  res.status(httpStatus.OK).json({
    status: 'success',
    messagge: 'Inicio de sesion exitoso',
    token, //Enviamos el token para que react lo guarde en el localstorage
    data: {
      usuario: usuarioEncontrado
    }
  });
});

module.exports = {
  login
};