const db = require('../config/conexion_db');

/**
 * Registra un visitante, su código QR temporal y la observación de la visita.
 * Usamos una "Transacción" para asegurar que todos los datos se guarden correctamente.
 */

const registrarVisitante = async(datosVisitante, observacion) => {
  //1. Pedimos una conexión exclusiva al pool para nuestra transacción
  const conexion = await db.getConnection();

  try {
    //2. Iniciamos la transacción. A partir de aquí, nada se guarda definitivamente hasta que hagamos 'commit'
    await conexion.beginTransaction();

    // 3. Insertar al visitante en la tabla 'personas'
    // tipo_persona = 4 (Visitante), tipo_estado = 1 (Activo)
    const sqlPersona = `
      INSERT INTO personas (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado)
      VALUES (?, ?, ?, ?, CURDATE(), 4, 1)`
    ;
    const valoresPersona = [
      datosVisitante.numero_documento,
      datosVisitante.tipo_doc,
      datosVisitante.nombres,
      datosVisitante.apellidos
    ];

    // Ejecutamos la inserción y capturamos el ID de la persona recién creada
    const [resultadoPersona] = await conexion.query(sqlPersona, valoresPersona);
    const idPersonaCreada = resultadoPersona.insertId;

    // 4. Crear el código QR temporal (Expira en 2 horas)
    // Usamos DATE_ADD(NOW(), INTERVAL 2 HOUR) nativo de MySQL para precisión exacta
    const sqlQr = `
      INSERT INTO qr_control (estado, fecha_creacion, fecha_expiracion, id_persona)
      VALUES ('activo', NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), ?)`
    ;

    // Ejecutamos la inserción y capturamos el ID del QR recién creado
    const [resultadoQr] = await conexion.query(sqlQr, [idPersonaCreada]);
    const idQrCreado = resultadoQr.insertId;

    // 5. Guardar la observación en la tabla 'visita'
    const sqlVisita = `
      INSERT INTO visita (observacion, id_qr)
      VALUES (?, ?)`
    ;
    await conexion.query(sqlVisita, [observacion, idQrCreado]);

    // 6. ¡Todo salió perfecto! Confirmamos y guardamos todo en la base de datos definitivamente
    await conexion.commit();

    // Retornamos el ID del QR para que el controlador se lo envíe a React
    return idQrCreado;
  } catch (error) {
    // Si CUALQUIER paso falla, deshacemos todos los cambios anteriores (Rollback)
    await conexion.rollback();
    // Lanzamos el error hacia arriba para que el catchAsync lo atrape
    throw error;
  } finally {
    // Siempre, sin importar si hubo éxito o error, liberamos la conexión para no saturar el servidor
    conexion.release();
  }
};

/**
 * Cambia el estado de una persona en el sistema (1 = Activo, 2 = Inactivo)
 */
const cambiarEstadoPersona = async (id_persona, idNuevoEstado) => {
  try {
    // Explicación: Actualizamos la tabla personas basándonos en su llave primaria (id_persona)
    const sql = `UPDATE personas SET tipo_estado = ? WHERE id_persona = ?`;
    
    // Ejecutamos la consulta. Recuerda que idNuevoEstado será un número (ej. 2)
    const [resultado] = await db.execute(sql, [idNuevoEstado, id_persona]);
    
    return resultado.affectedRows > 0;
  } catch (error) {
    console.error("Error en cambiarEstadoPersona:", error);
    throw error;
  }
};

module.exports = {
  registrarVisitante,
  cambiarEstadoPersona
};