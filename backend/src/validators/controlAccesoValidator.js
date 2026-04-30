// src/validators/accesoValidator.js
const { z } = require('zod');

// Esquema de seguridad: Exigimos que el id_qr sea un número entero y positivo
const escanearQRSchema = z.object({
    id_qr: z.number().int().positive('El ID del documento debe ser un número válido')
});

module.exports = { escanearQRSchema };