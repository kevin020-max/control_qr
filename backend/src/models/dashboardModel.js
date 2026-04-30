// src/models/dashboardModel.js
const db = require('../config/conexion_db');

const DashboardModel = {
  async obtenerEstadisticasHoy() {
    // Definimos las 4 consultas SQL necesarias
    // 1. Contar personas cuyo estado sea 1 (Activo)
    const sqlActivos = `SELECT COUNT(*) as total FROM personas WHERE tipo_estado = 1`;
    
    // 2. Contar accesos registrados el día de hoy (Entradas)
    const sqlIngresos = `SELECT COUNT(*) as total FROM control_acceso WHERE DATE(fecha_entrada) = CURDATE()`;
    
    // 3. Contar accesos que ya tienen fecha de salida el día de hoy
    const sqlSalidas = `SELECT COUNT(*) as total FROM control_acceso WHERE DATE(fecha_salida) = CURDATE()`;
    
    // 4. Contar visitantes (tipo_persona = 4) registrados el día de hoy
    const sqlVisitantes = `SELECT COUNT(*) as total FROM personas WHERE tipo_persona = 4 AND DATE(fecha_registro) = CURDATE()`;

    // 5. NUEVA CONSULTA: Lista de visitantes activos (Están adentro y su QR no ha expirado)
    // Cruzamos las tablas personas, qr_control, visita y control_acceso para obtener toda la info junta.
    const sqlListaVisitantes = `
      SELECT 
        p.nombres, 
        p.apellidos, 
        v.observacion, 
        ca.fecha_entrada, 
        qc.fecha_expiracion 
      FROM personas p
      JOIN qr_control qc ON p.id_persona = qc.id_persona
      JOIN visita v ON qc.id_qr = v.id_qr
      JOIN control_acceso ca ON p.id_persona = ca.id_persona
      WHERE p.tipo_persona = 4 
        AND ca.fecha_salida IS NULL 
        AND qc.fecha_expiracion > NOW()
      ORDER BY ca.fecha_entrada DESC
      LIMIT 4
    `;

    // NUEVA CONSULTA: Traemos el historial de Entradas/Salidas de todos los demás (Aprendices, Instructores, etc.)
    const sqlRegistrosRecientes = `
      SELECT 
        p.nombres, 
        p.apellidos, 
        p.tipo_persona, 
        ca.fecha_entrada, 
        ca.fecha_salida
      FROM control_acceso ca
      JOIN personas p ON ca.id_persona = p.id_persona
      WHERE p.tipo_persona != 4 -- Excluimos visitantes (porque ya tienen su lista naranja)
      ORDER BY ca.id_control DESC 
      LIMIT 5
    `;

    // Ejecutamos TODAS las consultas en paralelo
    const [resActivos, resIngresos, resSalidas, resVisitantes, resListaVisitantes, resRegistros] = await Promise.all([
      db.execute(sqlActivos),
      db.execute(sqlIngresos),
      db.execute(sqlSalidas),
      db.execute(sqlVisitantes),
      db.execute(sqlListaVisitantes),
      db.execute(sqlRegistrosRecientes) // Añadimos la ejecución de la nueva consulta
    ]);

    return {
      personasActivas: resActivos[0][0].total,
      ingresosHoy: resIngresos[0][0].total,
      salidasHoy: resSalidas[0][0].total,
      visitantesHoy: resVisitantes[0][0].total,
      listaVisitantes: resListaVisitantes[0],
      registrosRecientes: resRegistros[0] // Devolvemos el nuevo array al Frontend
    };
  }
};

module.exports = DashboardModel;