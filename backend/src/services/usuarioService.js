const bcrypt = require('bcrypt');
const db = require('../config/conexion_db');

/**
 * Crea automáticamente un usuario instructor.
 * Si ya existe una cuenta para ese documento, no hace nada.
 */
const crearUsuarioInstructor = async (persona) => {

    // Verificar si ya existe el usuario
    const [usuarioExistente] = await db.execute(
        'SELECT id_usuario FROM usuarios WHERE numero_documento = ?',
        [persona.numero_documento]
    );

    if (usuarioExistente.length > 0) {
        return;
    }

    // Contraseña por defecto
    const contraseniaEncriptada = await bcrypt.hash(
        'instructorsena',
        12
    );

    // Crear usuario del sistema
    await db.execute(
        `INSERT INTO usuarios
        (
            numero_documento,
            contrasenia,
            estado,
            id_rol
        )
        VALUES (?, ?, 1, 3)`,
        [
            persona.numero_documento,
            contraseniaEncriptada
        ]
    );

};

module.exports = {
    crearUsuarioInstructor
};