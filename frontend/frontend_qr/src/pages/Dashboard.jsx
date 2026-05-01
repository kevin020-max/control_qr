import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaQrcode, FaUserPlus, FaSignOutAlt, FaHome } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token'); // Borramos la llave
    navigate('/login'); // Lo mandamos afuera
  };

  return (
    <div style={estilos.contenedorPrincipal}>
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside style={estilos.sidebar}>
        <div style={estilos.logoCaja}>
          <h2 style={{ color: 'white', textAlign: 'center' }}>SENA QR</h2>
        </div>

        <nav style={estilos.menu}>
          {/* Usamos Link en lugar de <a> para que la página no se recargue */}
          <Link to="/dashboard/escaner" style={estilos.link}>
            <FaQrcode style={estilos.icono} /> Escanear QR
          </Link>
          <Link to="/dashboard/visitantes" style={estilos.link}>
            <FaUserPlus style={estilos.icono} /> Registrar Visitante
          </Link>
          <Link to="/dashboard" style={estilos.link}>
            <FaHome style={estilos.icono} /> Inicio
          </Link>
        </nav>

        <button onClick={cerrarSesion} style={estilos.botonSalir}>
          <FaSignOutAlt style={estilos.icono} /> Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main style={estilos.contenido}>
        {/* Aquí es donde se inyectarán mágicamente las pantallas de Escáner o Visitantes */}
        <Outlet /> 
      </main>
    </div>
  );
};

// Estilos rápidos en línea
const estilos = {
  contenedorPrincipal: { display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' },
  sidebar: { width: '250px', backgroundColor: '#39A900', display: 'flex', flexDirection: 'column', color: 'white' },
  logoCaja: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  menu: { flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 0' },
  link: { padding: '15px 20px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '16px', transition: 'background 0.3s' },
  icono: { marginRight: '10px', fontSize: '20px' },
  botonSalir: { padding: '15px 20px', backgroundColor: '#2d8700', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '16px', textAlign: 'left' },
  contenido: { flex: 1, padding: '30px', overflowY: 'auto' }
};

export default Dashboard;