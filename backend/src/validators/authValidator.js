//Importamos la libreria zod
const { z } = require('zod');

// Creamos un esquema (es como un contrato) que define cómo deben lucir los datos de login
const loginSchema = z.object({
  //Definimos que 'usuario' debe ser un string (texto) y si no no lo envían o lo envían vacío, mostrará ese mensaje
  usuario: z.string({
    required_error: "El nombre de usuario es obligatorio",
    invalid_type_error: "El nomnre de usuario debe ser texto"
  }).min(1, "El nombre de usuario no puede estar vacio"),

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