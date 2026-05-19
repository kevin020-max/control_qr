// Importamos tu clase manejadora de errores (ajusta la ruta si es necesario)
const AppError = require('../errors/AppError');

const validarPersona = (req, res, next) => {
    const { numero_documento, tipo_doc, nombres, apellidos } = req.body;

    // Verificamos que todos los campos requeridos existan y no estén vacíos
    if (!numero_documento || !tipo_doc || !nombres || !apellidos) {
        // Pasamos el error al middleware global de tu aplicación usando next()
        return next(new AppError("Faltan campos obligatorios para registrar la persona.", 400));
    }

    // Si todo está bien, dejamos que la petición continúe hacia el controlador
    next();
};

module.exports = {
    validarPersona
};