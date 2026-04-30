const catchAsync = require('../errors/catchAsync');
const httpStatus = require('../constants/httpStatus');
const visitanteModel = require('../models/visitanteModel');
const { visitanteSchema } = require('../validators/visitanteValidator');

/**
 * Controlador para registrar un nuevo visitante y generarle su QR temporal.
 */
const registrarVisitante = catchAsync(async (req, res, next) => {
  // 1. Validamos que los datos que envía el Frontend cumplan con nuestro esquema de Zod
  // Si algo falla, Zod lanzará un error y catchAsync lo mandará al middleware global de errores
  const datosValidados = visitanteSchema.parse(req.body);

  // Separamos la observación del resto de los datos personales para enviarlos al modelo
  const { observacion, ...datosPersona } = datosValidados;

  // 2. Llamamos a nuestro Modelo (que ejecutará la Transacción SQL)
  // Le pasamos los datos de la persona y la observación.
  const idQrGenerado = await visitanteModel.registrarVisitante(datosPersona, observacion);

  // 3. Respondemos al Frontend
  // Usamos el código 201 (CREATED) que es el estándar profesional cuando se crea un nuevo recurso.
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Visitante registrado y QR temporal generado con éxito',
    data: {
      id_qr: idQrGenerado,
      visitante: {
        nombre: datosPersona.nombres,
        apellidos: datosPersona.apellidos,
        expira_en: '2 horas'
      }
    }
  });
});

module.exports = {
  registrarVisitante
};