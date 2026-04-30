const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

// Importamos los dos modelos que creamos en los pasos anteriores
const qrModel = require('../models/qrModel');
const controlAccesoModel = require('../models/controlAccesoModel');

//Controlador para procesar el escaneo de un codigo QR
const escanearQr = catchAsync(async (req, res, next) => {
  // 1. Extraer el ID del QR que nos envía React (o Thunder Client) en el body
  const { id_qr } = req.body;

  if (!id_qr) {
    return next(new AppError('Por favor, proporciona el código QR escaneado', httpStatus.BAD_REQUEST));
  }

  //2. buscar el qr y a su dueño en la base de datos
  const infoQr = await qrModel.buscarQrPorId(id_qr);

  //Si el qr no existe en la base de datos, bloqueamos el acceso
  if (!infoQr) {
    return next(new AppError('Código QR no válido o no registrado en el sistema.', httpStatus.NOT_FOUND));
  }

  //3. Validar el estado QR y de la persona
  if (infoQr.estado_qr === 'expirado') {
    return next(new AppError('Este código QR temporal ha expirado', httpStatus.FORBIDDEN));
  }

  if (infoQr.estado_persona !== 1) {//1 es 'activo'
    return next(new AppError(`Acceso denegado: El usuario ${infoQr.nombres} se encuentra INACTIVO.`, httpStatus.FORBIDDEN));
  }

  //4. Logica de entrada o de salida
  // Revisamos si la persona ya tiene un ingreso sin salida
  const ingresoActivo = await controlAccesoModel.buscarIngresoActivo(infoQr.id_persona);

  let mensajeRespuesta = '';
  let tipoAccion = '';

  //req.usuario.id_usuario viene del token del operario (del middleware protegerRuta que hicimos antes)

  const idOperario = req.usuario.id_usuario;

  if (ingresoActivo) {
    // Si ya tenía un ingreso, le marcamos la SALIDA
    await controlAccesoModel.registrarSalida(ingresoActivo.id_control);
    mensajeRespuesta = 'Salida registrada correctamente';
    tipoAccion = 'salida';
  } else {
    // Si no tenía ingreso, le marcamos la ENTRADA
    await controlAccesoModel.registrarEntrada(infoQr.id_persona, idOperario);
    mensajeRespuesta = 'Entrada registrada correctamente';
    tipoAccion = 'entrada';
  }

  //5. Enviar la respuesta de exito a react
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