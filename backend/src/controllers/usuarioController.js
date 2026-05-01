const bcrypt = require('bcrypt');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const db = require('../config/conexion_db');

/**
 * Controlador Definitivo: Crear Usuario Interno
 * Si la persona no existe en la base de datos, la crea automáticamente antes de asignarle el rol.
 */
const crearUsuarioInterno = catchAsync(async (req, res, next) => {
  // 1. Ahora recibimos más datos por si necesitamos crear a la persona desde cero
  const { 
    numero_documento, 
    tipo_doc,       // Ej: 'CC', 'CE'
    nombres, 
    apellidos, 
    contrasena, 
    id_rol, 
    tipo_persona    // Ej: 2 (Instructor), 3 (Funcionario)
  } = req.body;

  // 2. Validación básica
  if (!numero_documento || !contrasena || !id_rol || !nombres || !apellidos || !tipo_doc || !tipo_persona) {
    return next(new AppError('Faltan datos obligatorios para registrar al usuario completo.', httpStatus.BAD_REQUEST));
  }

  // 3. Verificamos si la persona ya existe en la institución
  const [personas] = await db.execute('SELECT id_persona FROM personas WHERE numero_documento = ?', [numero_documento]);
  
  // 4. LA NUEVA LÓGICA: Si la persona NO existe, la registramos en la tabla 'personas'
  if (personas.length === 0) {
    console.log('🛑 [INFO] La persona no existe. Creando nuevo registro en la tabla personas...');
    
    // CURDATE() es una función de MySQL que pone la fecha de hoy automáticamente
    // tipo_estado 1 significa 'activo'
    const sqlInsertPersona = `
      INSERT INTO personas (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado) 
      VALUES (?, ?, ?, ?, CURDATE(), ?, 1)
    `;
    await db.execute(sqlInsertPersona, [numero_documento, tipo_doc, nombres, apellidos, tipo_persona]);
  }

  // 5. Verificamos que no tenga una cuenta de login ya creada
  const [usuariosPrevios] = await db.execute('SELECT id_usuario FROM usuarios WHERE numero_documento = ?', [numero_documento]);

  if (usuariosPrevios.length > 0) {
    return next(new AppError('Esta persona ya tiene una cuenta de usuario con acceso al sistema.', httpStatus.BAD_REQUEST));
  }

  // 6. Encriptamos la contraseña
  const contraseniaEncriptada = await bcrypt.hash(contrasena, 12);

  // 7. Insertamos la cuenta de acceso en la BD
  console.log('🛑 [INFO] Creando credenciales de acceso en la tabla usuarios...');
  const sqlInsertUsuario = `INSERT INTO usuarios (numero_documento, contrasenia, estado, id_rol) VALUES (?, ?, 1, ?)`;
  await db.execute(sqlInsertUsuario, [numero_documento, contraseniaEncriptada, id_rol]);

  // 8. Respuesta exitosa
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Usuario creado exitosamente en el sistema y con credenciales de acceso.'
  });
});

module.exports = {
  crearUsuarioInterno
};