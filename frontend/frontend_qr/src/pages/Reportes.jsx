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
  totalActivos: 0,
  ingresosTrimestre: 0,
  salidasTrimestre: 0,
  promedioDiario: 0,
  resumenHoy: {
    aprendices: 0,
    instructores: 0,
    funcionarios: 0,
    visitantes: 0
  }
});

const [cargandoPdf, setCargandoPdf] = useState(false);

const [periodo, setPeriodo] = useState('semana');

const [tipoPersona, setTipoPersona] = useState('general');

useEffect(() => {

  const cargarStats = async () => {

    try {

      const res = await api.get(
        '/reportes/estadisticas',
        {
          params: {
            periodo,
            tipoPersona
          }
        }
      );

      setStats(
        res.data.data
      );

    } catch (error) {

      console.error(
        'Error cargando estadísticas:',
        error
      );
    }
  };

  cargarStats();

}, [periodo, tipoPersona]);

const manejarDescargaPDF = async () => {

  setCargandoPdf(true);

  try {

    const respuesta = await api.get(
      '/reportes/descargar-hoy',
      {
        responseType: 'blob'
      }
    );

    const urlArchivo =
      window.URL.createObjectURL(
        new Blob([respuesta.data])
      );

    const link =
      document.createElement('a');

    link.href = urlArchivo;

    link.setAttribute(
      'download',
      `Reporte_Accesos_SENA_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (error) {

    console.error(
      'Error al descargar el PDF:',
      error
    );

    alert(
      'Hubo un error al generar el reporte.'
    );

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
          <select
            value={periodo}
            onChange={(e) =>
              setPeriodo(e.target.value)
            }
          >
            <option value="semana">
              Esta semana
            </option>

            <option value="mes">
              Este mes
            </option>

            <option value="trimestre">
              Este trimestre
            </option>
          </select>
        </div>
        <div className="filtro-select">
          <FaFilter className="icono-filtro" />
          <select
            value={tipoPersona}
            onChange={(e) =>
              setTipoPersona(e.target.value)
            }
          >
            <option value="general">
              General
            </option>

            <option value="aprendiz">
              Solo Aprendices
            </option>

            <option value="visitante">
              Solo Visitantes
            </option>
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