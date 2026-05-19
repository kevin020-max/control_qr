// src/controllers/controlAccesoController.js
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const qrModel = require('../models/qrModel');
const visitantesModel = require('../models/visitanteModel');
const controlAccesoModel = require('../models/controlAccesoModel');
const { escanearQRSchema } = require('../validators/controlAccesoValidator');
const controlAccesoService = require('../services/controlAccesosService');

/**
 * Controlador para enviar el consolidado de entradas y salidas de hoy
 */
const getAccesosHoy = async (req, res) => {
    try {
        const registros = await controlAccesoService.obtenerAccesosDelDia();
        return res.status(200).json({
            status: 'success',
            data: registros // Esto es lo que busca tu respuesta.data.data en React
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al consultar los accesos de hoy',
            error: error.message
        });
    }
};

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
  if (infoQr.tipo_persona_texto.toLowerCase() === 'visitante') {
    
    if (!infoQr.id_qr) {
      return next(new AppError(`El visitante ${infoQr.nombres} no tiene un QR temporal asignado.`, httpStatus.BAD_REQUEST));
    }
    
    // A. Verificamos si el QR ya había sido marcado como expirado antes
    if (infoQr.estado_qr === 'expirado') {
      return next(new AppError('Acceso denegado: Este código QR temporal ha expirado', httpStatus.FORBIDDEN));
    }

    // B. LA NUEVA LÓGICA: Comparamos el reloj actual con la fecha límite del QR
    const relojActual = new Date(); // Captura el milisegundo exacto de ahora
    const limiteExpiracion = new Date(infoQr.fecha_expiracion); // Convierte la fecha de MySQL a formato JavaScript

    // Si la hora de ahora es MAYOR (es decir, ocurrió después) que el límite...
    if (relojActual > limiteExpiracion) {
      
      // 1. Apagamos el QR en la base de datos
      await qrModel.cambiarEstadoQr(infoQr.id_qr, 'expirado');
      
      // 2. Apagamos al visitante para que no quede como 'activo' en tu inicio
      // Recordemos que en tu tabla 'estado', el 2 significa 'inactivo'
      await visitantesModel.cambiarEstadoPersona(infoQr.id_persona, 2); 

      // 3. Bloqueamos la puerta y le avisamos al Frontend
      return next(new AppError(`Acceso denegado: El tiempo de visita de ${infoQr.nombres} finalizó.`, httpStatus.FORBIDDEN));
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
  escanearQr,
  getAccesosHoy
};