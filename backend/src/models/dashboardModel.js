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

    // Ejecutamos todas las consultas al mismo tiempo para mayor velocidad
    const [resActivos, resIngresos, resSalidas, resVisitantes] = await Promise.all([
      db.execute(sqlActivos),
      db.execute(sqlIngresos),
      db.execute(sqlSalidas),
      db.execute(sqlVisitantes)
    ]);

    // Retornamos un objeto ordenado con los resultados
    // [0][0] significa: Del resultado de la consulta, dame la primera fila y la columna 'total'
    return {
      personasActivas: resActivos[0][0].total,
      ingresosHoy: resIngresos[0][0].total,
      salidasHoy: resSalidas[0][0].total,
      visitantesHoy: resVisitantes[0][0].total
    };
  }
};

module.exports = DashboardModel;