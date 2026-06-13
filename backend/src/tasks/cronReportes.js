const cron = require('node-cron');
const path = require('path');
const fs = require('path');
const fsExtra = require('fs'); // Asegurarnos de que las carpetas existan
const reporteService = require('../services/reporteService');

/**
 * Inicializa todos los Cron Jobs automatizados del sistema QR
 */
const iniciarTareasProgramadas = () => {
    console.log("[Cron] ⏰ Sistema de tareas automatizadas inicializado con éxito.");

    // EXPRESIÓN CRON: '0 22 * * *' significa: Minuto 0, Hora 22 (10:00 PM), todos los días.
    cron.schedule('0 22 * * *', async () => {
        console.log("[Cron] 📄 Iniciando generación automática del reporte diario de asistencia...");
        
        const nombreArchivo = `Reporte_Diario_${new Date().toISOString().slice(0, 10)}.pdf`;
        const carpetaDestino = path.join(__dirname, '../../storage/reportes');
        
        // Crear la carpeta si no existe
        if (!fsExtra.existsSync(carpetaDestino)) {
            fsExtra.mkdirSync(carpetaDestino, { recursive: true });
        }

        const rutaCompleta = path.join(carpetaDestino, nombreArchivo);

        try {
            await reporteService.generarPdfIngresosHoy(rutaCompleta);
            console.log(`[Cron] ✅ Reporte automatizado guardado con éxito en: ${nombreArchivo}`);
            
            // TIP PRO DE INGENIERÍA: Aquí podrías llamar a un servicio de correo (Nodemailer) 
            // para enviárselo directamente al email del jefe de seguridad de manera automática.
        } catch (error) {
            console.error("[Cron] ❌ Error generando reporte automático diario:", error.message);
        }
    });
};

module.exports = {
    iniciarTareasProgramadas
};