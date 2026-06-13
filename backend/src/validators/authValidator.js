//Importamos la libreria zod
const { z } = require('zod');

// Creamos un esquema (es como un contrato) que define cómo deben lucir los datos de login
const loginSchema = z.object({
  //Definimos que 'numero_documento' debe ser un number(numero) y si no no lo envían o lo envían vacío, mostrará ese mensaje
  numero_documento: z.number({
    required_error: "El número de documento es obligatorio",
    invalid_type_error: "El número de documento debe ser un número"
  }).int().positive("El número de documento debe ser un número positivo"),

  // Definimos que 'contraseña' debe ser texto y tener al menos 6 caracteres por seguridad
  contrasena: z.string({
    required_error: "La contraseña es obligatoria",
    invalid_type_error: "La contraseña debe ser texto"
  }).min(6, "La contraseña debe tener al menos 6 caracteres")
});

// Exportamos nuestros esquemas (podemos tener varios en este archivo en el futuro)
module.exports = {
  loginSchema
}