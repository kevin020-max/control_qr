// src/pages/Alertas.jsx
import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaClock, FaCheckCircle } from 'react-icons/fa'; // Añadimos FaCheckCircle
import api from '../services/api';
import '../styles/Alertas.css';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true); // Estado de carga inicial

  useEffect(() => {
    const consultarAlertas = async () => {
      try {
        const respuesta = await api.get('/qr/alertas-vencimiento');
        setAlertas(respuesta.data.data || []); 
      } catch (error) {
        console.error("Error consultando alertas de tiempo:", error);
      } finally {
        setCargando(false);
      }
    };

    consultarAlertas();
    const intervalo = setInterval(consultarAlertas, 30000);
    return () => clearInterval(intervalo);
  }, []);

  if (cargando) {
    return (
      <div className="modulo-alertas">
        <h2 className="titulo-alertas">Alertas del sistema</h2>
        <p className="subtitulo-alertas">Cargando estado de las alertas...</p>
      </div>
    );
  }

  return (
    <div className="modulo-alertas">
      <h2 className="titulo-alertas">Alertas del sistema</h2>
      
      {/* 1. MÓDULO VACÍO - IGUAL A TU FIGMA */}
      {alertas.length === 0 ? (
        <div className="tarjeta-alertas-vacia">
          <p className="subtitulo-vacio-top">Todas las alertas están al día</p>
          <div className="caja-vacia-blanca">
            <FaCheckCircle className="icono-check-vacio" />
            <p className="texto-vacio-alertas">No hay alertas sin leer</p>
          </div>
        </div>
      ) : (
        /* 2. MÓDULO CON NOTIFICACIONES ACTIVAS */
        <div className="contenedor-alertas-lista">
          <p className="subtitulo-alertas">Revisa los códigos QR próximos a expirar o vencidos hoy</p>
          {alertas.map((alerta) => (
            <div 
              key={alerta.id_qr} 
              className={`alerta-card-box ${alerta.minutos_restantes <= 0 ? 'critica' : 'advertencia'}`}
            >
              <div className="alerta-info-item">
                <FaExclamationTriangle className="icono-alerta-sena" />
                <span>
                  {alerta.minutos_restantes <= 0 
                    ? `El QR del visitante ${alerta.nombre_visitante} ha EXPIRADO.` 
                    : `El QR del visitante ${alerta.nombre_visitante} vencerá en menos de ${alerta.minutos_restantes} minutes.`}
                </span>
              </div>
              <div className="alerta-tiempo-marca">
                <FaClock /> {alerta.hora_expiracion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alertas;