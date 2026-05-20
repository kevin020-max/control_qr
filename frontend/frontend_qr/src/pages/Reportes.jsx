// src/pages/Reportes.jsx
import { useState, useEffect } from 'react';
import { 
  FaUsers, FaSignInAlt, FaSignOutAlt, FaChartLine, 
  FaDownload, FaCalendarAlt, FaFilter, FaSpinner 
} from 'react-icons/fa';
import api from '../services/api';
import '../styles/Reportes.css';

const Reportes = () => {
  // 1. ESTADO DE LAS ESTADÍSTICAS (Valores por defecto para evitar errores)
  const [stats, setStats] = useState({
    totalActivos: 456,
    ingresosTrimestre: '1.297',
    salidasTrimestre: '1.277',
    promedioDiario: 234,
    resumenHoy: {
      aprendices: 380,
      instructores: 45,
      funcionarios: 31,
      visitantes: 12
    }
  });

  const [cargandoPdf, setCargandoPdf] = useState(false);

  // Opcional: Cargar los datos reales desde tu backend al montar la pantalla
  // useEffect(() => {
  //   const cargarStats = async () => {
  //     const res = await api.get('/reportes/estadisticas');
  //     setStats(res.data.data);
  //   }
  //   cargarStats();
  // }, []);

  // 2. FUNCIÓN PARA DESCARGAR EL PDF DESDE EL BACKEND
  const manejarDescargaPDF = async () => {
    setCargandoPdf(true);
    try {
      // NOTA CLAVE: Cuando pides un archivo físico (PDF, Excel) a Axios, 
      // debes decirle que el responseType es 'blob' (Binary Large Object).
      const respuesta = await api.get('/reportes/descargar-hoy', {
        responseType: 'blob' 
      });

      // Creamos una URL temporal en la memoria del navegador con ese archivo
      const urlArchivo = window.URL.createObjectURL(new Blob([respuesta.data]));
      
      // Creamos un enlace invisible <a>, le damos clic automático y lo borramos
      const link = document.createElement('a');
      link.href = urlArchivo;
      link.setAttribute('download', `Reporte_Accesos_SENA_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      alert("Hubo un error al generar el reporte. Inténtalo de nuevo.");
    } finally {
      setCargandoPdf(false);
    }
  };

  return (
    <div className="modulo-reportes">
      <div className="encabezado-reportes">
        <h2>Reportes de Accesos</h2>
        <p>Consulte el historial general de entradas, salidas y ocupación del centro.</p>
      </div>

      {/* --- FILTROS SUPERIORES --- */}
      <div className="caja-filtros">
        <div className="filtro-select">
          <FaCalendarAlt className="icono-filtro" />
          <select>
            <option>Esta semana</option>
            <option>Este mes</option>
            <option>Este trimestre</option>
          </select>
        </div>
        <div className="filtro-select">
          <FaFilter className="icono-filtro" />
          <select>
            <option>General</option>
            <option>Solo Aprendices</option>
            <option>Solo Visitantes</option>
          </select>
        </div>
      </div>

      {/* --- FILA 1: MÉTRICAS MACRO --- */}
      <div className="grid-metricas-macro">
        <div className="tarjeta-metrica">
          <div>
            <p>Total activos</p>
            <h3>{stats.totalActivos}</h3>
          </div>
          <div className="icono-caja verde-claro"><FaUsers /></div>
        </div>
        <div className="tarjeta-metrica">
          <div>
            <p>Ingresos por Trimestre</p>
            <h3>{stats.ingresosTrimestre}</h3>
          </div>
          <div className="icono-caja verde-sena"><FaSignInAlt /></div>
        </div>
        <div className="tarjeta-metrica">
          <div>
            <p>Salidas por Trimestre</p>
            <h3>{stats.salidasTrimestre}</h3>
          </div>
          <div className="icono-caja verde-sena"><FaSignOutAlt /></div>
        </div>
        <div className="tarjeta-metrica">
          <div>
            <p>Promedio diario</p>
            <h3>{stats.promedioDiario}</h3>
          </div>
          <div className="icono-caja verde-claro"><FaChartLine /></div>
        </div>
      </div>

      {/* --- FILA 2: RESUMEN DE HOY --- */}
      <div className="caja-resumen-hoy">
        <h3>Resumen de hoy</h3>
        <div className="grid-resumen-hoy">
          <div className="tarjeta-resumen">
            <p>Aprendices</p>
            <h4>{stats.resumenHoy.aprendices}</h4>
          </div>
          <div className="tarjeta-resumen">
            <p>Instructores</p>
            <h4>{stats.resumenHoy.instructores}</h4>
          </div>
          <div className="tarjeta-resumen">
            <p>Funcionarios</p>
            <h4>{stats.resumenHoy.funcionarios}</h4>
          </div>
          <div className="tarjeta-resumen">
            <p>Visitantes</p>
            <h4>{stats.resumenHoy.visitantes}</h4>
          </div>
        </div>
      </div>

      {/* --- BOTÓN DE DESCARGA PDF --- */}
      <button 
        className="btn-descargar-pdf" 
        onClick={manejarDescargaPDF}
        disabled={cargandoPdf}
      >
        {cargandoPdf ? (
          <><FaSpinner className="icono-girando" /> Generando Documento...</>
        ) : (
          <><FaDownload /> Descargar PDF de reportes</>
        )}
      </button>

    </div>
  );
};

export default Reportes;