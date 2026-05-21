const db = require('../config/conexion_db');
const AppError = require('../errors/AppError');
const catchAsync = require('../errors/catchAsync');

/**
 * ============================================================================
 * CREATE: Registrar un Aprendiz Manualmente
 * ============================================================================
 */
const crearAprendiz = catchAsync(async (req, res, next) => {
  // 1. Extraemos los datos que nos enviará el formulario de React
  const { numero_documento, tipo_doc, nombres, apellidos, id_ficha } = req.body;

  // 2. Validaciones básicas de seguridad
  if (!numero_documento || !nombres || !apellidos || !id_ficha) {
    return next(new AppError('Por favor, completa todos los campos obligatorios.', 400));
  }

  
  // CANDADO DE EXCLUSIVIDAD: Verificar si el documento ya pertenece al Personal del Sistema
  const [esPersonalInterno] = await db.execute(
    'SELECT id_persona FROM personas WHERE numero_documento = ? AND tipo_persona IN (2, 3)', 
    [numero_documento] // 2: Instructor, 3: Funcionario/Guarda/Admin
  );

  if (esPersonalInterno.length > 0) {
    return next(new AppError('Operación denegada. Este número de documento ya está registrado en el sistema con un perfil administrativo/instructor y no puede duplicarse como Aprendiz.', httpStatus.BAD_REQUEST));
  }

  // 3. Verificamos que el documento no esté registrado ya en el sistema
  const [existePersona] = await db.execute('SELECT * FROM personas WHERE numero_documento = ?', [numero_documento]);
  if (existePersona.length > 0) {
    return next(new AppError('Este número de documento ya está registrado en el sistema.', 400));
  }

  // 4. Inserción en la base de datos. 
  // OJO AQUÍ: Forzamos tipo_persona = 1 (Aprendiz) y tipo_estado = 1 (Activo)
  const sql = `
    INSERT INTO personas 
    (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha) 
    VALUES (?, ?, ?, ?, CURDATE(), 1, 1, ?)
  `;

  // Ejecutamos la consulta con los datos blindados
  await db.execute(sql, [numero_documento, tipo_doc, nombres, apellidos, id_ficha]);

  // 5. Respondemos con éxito
  res.status(201).json({
    status: 'success',
    message: 'Aprendiz registrado exitosamente en la institución.'
  });
});

/**
 * ============================================================================
 * READ: Obtener la lista de Aprendices con el nombre de su Ficha
 * ============================================================================
 */
const obtenerAprendices = catchAsync(async (req, res, next) => {
  // Usamos INNER JOIN para cruzar la tabla personas con la tabla ficha
  // Filtramos por tipo_persona = 1 para que NO salgan instructores ni guardas
  const sql = `
    SELECT 
      p.id_persona,
      p.numero_documento,
      p.tipo_doc,
      p.nombres,
      p.apellidos,
      p.tipo_estado,
      f.numero_ficha,
      f.nombre AS nombre_programa
    FROM personas p
    INNER JOIN ficha f ON p.id_ficha = f.id_ficha
    WHERE p.tipo_persona = 1
  `;
  
  const [aprendices] = await db.execute(sql);

  res.status(200).json({
    status: 'success',
    resultados: aprendices.length,
    data: aprendices
  });
});

/**
 * ============================================================================
 * UPDATE: Actualizar datos básicos de un Aprendiz
 * ============================================================================
 */
const actualizarAprendiz = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Obtenemos el id_persona de la URL
  const { tipo_doc, nombres, apellidos, id_ficha } = req.body;

  // Validamos que nos envíen la información necesaria
  if (!nombres || !apellidos || !id_ficha) {
    return next(new AppError('Los nombres, apellidos y la ficha son obligatorios.', 400));
  }

  const sql = `
    UPDATE personas 
    SET tipo_doc = ?, nombres = ?, apellidos = ?, id_ficha = ? 
    WHERE id_persona = ? AND tipo_persona = 1
  `;
  
  // Ejecutamos la actualización. El "tipo_persona = 1" asegura que por error no editemos a un guarda o instructor.
  const [resultado] = await db.execute(sql, [tipo_doc, nombres, apellidos, id_ficha, id]);

  if (resultado.affectedRows === 0) {
    return next(new AppError('No se encontró un aprendiz con ese ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Datos del aprendiz actualizados correctamente.'
  });
});

/**
 * ============================================================================
 * DELETE (Soft Delete): Cambiar el estado del Aprendiz (Activo/Inactivo)
 * ============================================================================
 */
const cambiarEstadoAprendiz = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { estado } = req.body; // El frontend enviará 1 (Activo) o 2 (Inactivo)

  // Validamos estrictamente las nuevas reglas de negocio de tu base de datos
  if (estado !== 1 && estado !== 2) {
    return next(new AppError('El estado debe ser 1 (Activo) o 2 (Inactivo).', 400));
  }

  const sql = 'UPDATE personas SET tipo_estado = ? WHERE id_persona = ? AND tipo_persona = 1';
  const [resultado] = await db.execute(sql, [estado, id]);

  if (resultado.affectedRows === 0) {
    return next(new AppError('No se encontró un aprendiz con ese ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: estado === 1 ? 'Aprendiz habilitado exitosamente.' : 'Aprendiz inhabilitado del sistema.'
  });
});

// ¡IMPORTANTE! No olvides exportar las nuevas funciones:
module.exports = {
  crearAprendiz,
  obtenerAprendices,
  actualizarAprendiz,
  cambiarEstadoAprendiz
};