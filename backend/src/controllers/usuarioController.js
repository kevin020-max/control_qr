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
  // 1. Recibimos los datos (Asegúrate de recibir 'contrasenia')
  const { 
    numero_documento, 
    tipo_doc,       
    nombres, 
    apellidos, 
    contrasenia,    // <-- CAMBIO 1: Debe coincidir con lo que envía React (con 'i')
    id_rol, 
    tipo_persona    
  } = req.body;

  // 2. Validación básica
  if (!numero_documento || !contrasenia || !id_rol || !nombres || !apellidos || !tipo_doc || !tipo_persona) { // <-- CAMBIO 2: Validar 'contrasenia'
    return next(new AppError('Faltan datos obligatorios para registrar al usuario completo.', httpStatus.BAD_REQUEST));
  }

  
    // CANDADO DE EXCLUSIVIDAD: Verificar si el documento ya pertenece a un Aprendiz
  const [esAprendiz] = await db.execute(
    'SELECT id_persona FROM personas WHERE numero_documento = ? AND tipo_persona = 1', 
    [numero_documento]
  );

  if (esAprendiz.length > 0) {
    return next(new AppError('No se puede registrar como usuario interno. Este número de documento ya está asignado a un Aprendiz activo en la institución.', httpStatus.BAD_REQUEST));
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
  const contraseniaEncriptada = await bcrypt.hash(contrasenia, 12); // <-- CAMBIO 3: Usar 'contrasenia'

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

// Controlador optimizado para obtener la lista de usuarios con filtro dinámico por Rol
const obtenerUsuarios = catchAsync(async (req, res, next) => {
  const { id_rol } = req.query; // Capturamos el query param opcional (ej: ?id_rol=2)
  
  let sql = `
    SELECT
      u.id_usuario,
      u.estado,
      u.id_rol,
      p.numero_documento,
      p.nombres,
      p.apellidos,
      r.nombre_rol
    FROM usuarios u
    INNER JOIN personas p ON u.numero_documento = p.numero_documento
    INNER JOIN roles r ON u.id_rol = r.id_rol
  `;
  
  const parametros = [];
  
  // Si el frontend envía un rol específico para filtrar, inyectamos la cláusula WHERE
  if (id_rol) {
    sql += ` WHERE u.id_rol = ?`;
    parametros.push(Number(id_rol));
  }
  
  // Mantenemos ordenados los registros para una mejor lectura visual
  sql += ` ORDER BY u.id_usuario DESC`;

  const [usuarios] = await db.execute(sql, parametros);

  res.status(httpStatus.OK).json({
    status: 'success',
    resultados: usuarios.length,
    data: usuarios
  });
});

// Controlador para actualizar el rol de un usuario específico (solo el rol, no otros datos)
const actualizarRolUsuario = catchAsync(async (req, res, next) => {
  // Extraemos el ID de la URL (ej: /api/usuarios/5)
  const { id } = req.params; 
  // Extraemos el nuevo rol que envía el frontend en el body
  const { id_rol } = req.body;

  if (!id_rol) {
    return next(new AppError('Debes proporcionar un nuevo rol válido.', httpStatus.BAD_REQUEST));
  }

  // Actualizamos únicamente el campo id_rol
  const sql = 'UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?';
  const [resultado] = await db.execute(sql, [id_rol, id]);

  // Si affectedRows es 0, significa que el id_usuario no existe en la BD
  if (resultado.affectedRows === 0) {
    return next(new AppError('No se encontró ningún usuario con ese ID.', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Rol de usuario actualizado correctamente.'
  });
});

// Controlador para eliminar un usuario (cambiar su estado a inactivo)
const cambiarEstadoUsuario = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { estado } = req.body; // El frontend enviará 1 (Activar) o 2 (Desactivar)

  // Validamos que el estado sea estrictamente 1 o 2
  if (estado !== 1 && estado !== 2) {
    return next(new AppError('El estado debe ser 1 (Activo) o 2 (Inactivo).', httpStatus.BAD_REQUEST));
  }

  const sql = 'UPDATE usuarios SET estado = ? WHERE id_usuario = ?';
  const [resultado] = await db.execute(sql, [estado, id]);

  if (resultado.affectedRows === 0) {
    return next(new AppError('No se encontró ningún usuario con ese ID.', httpStatus.NOT_FOUND));
  }

  const mensaje = estado === 1 ? 'Usuario activado exitosamente.' : 'Usuario desactivado del sistema.';

  res.status(httpStatus.OK).json({
    status: 'success',
    message: mensaje
  });
});

module.exports = {
  crearUsuarioInterno,
  obtenerUsuarios,
  actualizarRolUsuario,
  cambiarEstadoUsuario
};