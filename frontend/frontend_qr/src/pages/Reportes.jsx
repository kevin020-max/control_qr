// src/pages/Reportes.jsx
import { useNavigate } from 'react-router-dom';

const Reportes = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    // 1. Borramos los datos del "bolsillo" del navegador
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // 2. Lo pateamos al Login
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#00324D' }}>Módulo de Reportes</h1>
      <p>Aquí los Instructores y Coordinadores verán la asistencia y tiempos de permanencia.</p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {/* Botón para regresar al panel principal (solo si es admin o guarda) */}
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ padding: '10px 20px', backgroundColor: '#39A900', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Volver al Inicio
        </button>
      </div>
      
      <button 
        onClick={cerrarSesion} 
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Reportes;