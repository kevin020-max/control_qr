const { z } = require('zod');

// Creamos el "contrato" de lo que obligatoriamente debe enviar React
const visitanteSchema = z.object({
  // El documento debe ser un número entero y positivo
  numero_documento: z.number({
    required_error: "El número de documento es obligatorio",
    invalid_type_error: "El documento debe ser un número"
  }).int().positive("El número de documento debe ser un número positivo"),

  // El tipo de documento debe ser texto (ej: 'CC', 'TI', 'CE')
  tipo_doc: z.string({
    required_error: "El tipo de documento es obligatorio",
  }).min(2, "El tipo de documento debe tener al menos 2 caracteres"),

  // Nombres y apellidos obligatorios
  nombres: z.string({
    required_error: "Los nombres son obligatorios",
  }).min(2, "El nombre es muy corto"),

  apellidos: z.string({
    required_error: "Los apellidos son obligatorios",
  }).min(2, "El apellido es muy corto"),

  // La observación también es obligatoria según tus requerimientos
  observacion: z.string({
    required_error: "Debes agregar una observación para el visitante",
  }).min(5, "La observacion debe ser más detallada"),
});

module.exports = {
  visitanteSchema
};