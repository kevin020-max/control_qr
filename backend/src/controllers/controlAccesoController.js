// src/controllers/controlAccesoController.js
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const qrModel = require('../models/qrModel');
const controlAccesoModel = require('../models/controlAccesoModel');
const { escanearQRSchema } = require('../validators/controlAccesoValidator');

const escanearQr = catchAsync(async (req, res, next) => {
  // 1. Zod extrae y valida el documento (número limpio)
  const { id_qr } = escanearQRSchema.parse(req.body);

  // 2. Buscamos a la persona cruzando las tablas (personas + tipo_persona + qr_control)
  const infoQr = await qrModel.buscarQrPorDocumento(id_qr);

  if (!infoQr) {
    return next(new AppError('Usuario no encontrado en el sistema.', httpStatus.NOT_FOUND));
  }

  // 3. REGLA GENERAL: Validar que la persona esté ACTIVA en el centro
  // El ID 1 significa 'activo' en tu base de datos
  if (infoQr.estado_persona !== 1) { 
    return next(new AppError(`Acceso denegado: El usuario ${infoQr.nombres} se encuentra INACTIVO.`, httpStatus.FORBIDDEN));
  }

  // 4. REGLA DE NEGOCIO: Diferenciar Visitantes de Personal Permanente
  // Convertimos a minúsculas por si acaso viene como "VISITANTE" o "visitante"
  if (infoQr.tipo_persona_texto.toLowerCase() === 'visitante') {
    // Si es visitante, SÍ debe tener un QR temporal
    if (!infoQr.id_qr) {
      return next(new AppError(`El visitante ${infoQr.nombres} no tiene un QR temporal asignado.`, httpStatus.BAD_REQUEST));
    }
    // Y debemos validar que ese QR no esté expirado[cite: 2]
    if (infoQr.estado_qr === 'expirado') {
      return next(new AppError('Acceso denegado: Este código QR temporal ha expirado', httpStatus.FORBIDDEN));
    }
  }

  // 5. Lógica de entrada o salida
  // Revisamos si la persona ya tiene un ingreso sin salida
  const ingresoActivo = await controlAccesoModel.buscarIngresoActivo(infoQr.id_persona);

  let mensajeRespuesta = '';
  let tipoAccion = '';

  // Ojo aquí: usualmente el middleware de autenticación inyecta "req.user"
  const idOperario = req.usuario.id_usuario; 

  if (ingresoActivo) {
    // Si ya tenía un ingreso abierto, le marcamos la SALIDA
    await controlAccesoModel.registrarSalida(ingresoActivo.id_control);
    mensajeRespuesta = 'Salida registrada correctamente';
    tipoAccion = 'salida';
  } else {
    // Si no tenía ingreso, le marcamos la ENTRADA
    await controlAccesoModel.registrarEntrada(infoQr.id_persona, idOperario);
    mensajeRespuesta = 'Entrada registrada correctamente';
    tipoAccion = 'entrada';
  }

  // 6. Enviar la respuesta de éxito a React
  res.status(httpStatus.OK).json({
    status: 'success',
    message: mensajeRespuesta,
    data: {
      accion: tipoAccion,
      persona: {
        nombres: infoQr.nombres,
        apellidos: infoQr.apellidos,
        tipo_persona: infoQr.tipo_persona_texto,
        estado: infoQr.estado_persona === 1 ? 'activo' : 'inactivo'
      }
    }
  });
});

module.exports = {
  escanearQr
};