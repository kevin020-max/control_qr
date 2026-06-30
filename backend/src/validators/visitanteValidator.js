const { z } = require('zod');

// Creamos el "contrato" de lo que obligatoriamente debe enviar React
const visitanteSchema = z.object({

  // Documento
  numero_documento: z.number({
    required_error: "El número de documento es obligatorio",
    invalid_type_error: "El documento debe ser un número"
  })
  .int()
  .positive("El número de documento debe ser un número positivo")
  .max(2147483647, "El número de documento supera el tamaño permitido."),

  // Tipo documento
  tipo_doc: z.string({
    required_error: "El tipo de documento es obligatorio",
  })
  .min(2, "El tipo de documento debe tener al menos 2 caracteres"),

  // Nombres
  nombres: z.string({
    required_error: "Los nombres son obligatorios",
  })
  .min(2, "El nombre es muy corto"),

  // Apellidos
  apellidos: z.string({
    required_error: "Los apellidos son obligatorios",
  })
  .min(2, "El apellido es muy corto"),

  // Observación
  observacion: z.string({
    required_error: "Debes agregar una observación para el visitante",
  })
  .min(5, "La observación debe ser más detallada"),

  // Horas de validez
  horas_validez: z.number({
    required_error: "Debes indicar las horas de validez.",
    invalid_type_error: "Las horas de validez deben ser un número."
  })
  .int("Solo se permiten horas completas.")
  .min(1, "La duración mínima es de 1 hora.")
  .max(12, "La duración máxima permitida es de 12 horas.")

});

module.exports = {
  visitanteSchema
};