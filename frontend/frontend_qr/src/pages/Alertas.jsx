// src/components/SeccionAlertas.jsx
import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';
import api from '../services/api';
import '../styles/Alertas.css';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const consultarAlertas = async () => {
      try {
        const respuesta = await api.get('/qr/alertas-vencimiento');
        setAlertas(respuesta.data.data); // Esperamos un array de alertas del backend
      } catch (error) {
        console.error("Error consultando alertas de tiempo:", error);
      }
    };

    consultarAlertas();
    // Sondeo (polling) automático cada 30 segundos para actualización en vivo
    const intervalo = setInterval(consultarAlertas, 30000);
    return () => clearInterval(intervalo);
  }, []);

  if (alertas.length === 0) return null; // Si todo está en orden, no ocupa espacio en pantalla

  return (
    <div className="contenedor-alertas">
      {alertas.map((alerta) => (
        <div 
          key={alerta.id_qr} 
          className={`alerta-card ${alerta.minutos_restantes <= 0 ? 'critica' : 'advertencia'}`}
        >
          <div className="alerta-info">
            <FaExclamationTriangle className="icono-alerta" />
            <span>
              {alerta.minutos_restantes <= 0 
                ? `El QR del visitante ${alerta.nombre_visitante} ha EXPIRADO.` 
                : `El QR del visitante ${alerta.nombre_visitante} vencerá en menos de ${alerta.minutos_restantes} minutos.`}
            </span>
          </div>
          <div className="alerta-tiempo">
            <FaClock /> {alerta.hora_expiracion}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alertas;