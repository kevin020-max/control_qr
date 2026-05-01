import { Outlet, Link, useNavigate } from 'react-router-dom';
// 1. Importamos dos íconos nuevos para las funciones del Administrador
import { FaQrcode, FaUserPlus, FaSignOutAlt, FaHome, FaFileUpload, FaUserCog, FaChartBar, FaUser, FaUserGraduate } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();

  // 2. EXTRAER EL ROL DEL USUARIO
  // Buscamos el "bolsillo" del navegador para saber quién inició sesión
  const usuarioString = localStorage.getItem('usuario');
  let id_rol = null;

  // Si hay un usuario guardado, lo convertimos a objeto JavaScript y sacamos su rol
  if (usuarioString) {
    const usuario = JSON.parse(usuarioString);
    id_rol = usuario.id_rol;
  }

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // Es buena práctica borrar también al usuario
    navigate('/login');
  };

  return (
    <div style={estilos.contenedorPrincipal}>
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside style={estilos.sidebar}>
        <div style={estilos.logoCaja}>
          <h2 style={{ color: 'white', textAlign: 'center' }}>SENA QR</h2>
        </div>

        <nav style={estilos.menu}>
          {/* BOTONES COMUNES: El inicio, el escáner y registrar visitante los ven el Admin y el Guarda */}
          <Link to="/dashboard" style={estilos.link}>
            <FaHome style={estilos.icono} /> Inicio
          </Link>
          <Link to="/dashboard/escaner" style={estilos.link}>
            <FaQrcode style={estilos.icono} /> Escanear QR
          </Link>
          <Link to="/dashboard/visitantes" style={estilos.link}>
            <FaUserPlus style={estilos.icono} /> Registrar Visitante
          </Link>

          {/* 3. LA MAGIA: RENDERIZADO CONDICIONAL */}
          {/* El código dentro de estos paréntesis SOLO se dibujará si id_rol es exactamente 1 */}
          {id_rol === 1 && (
            <>
              {/* Usamos un pequeño separador visual opcional */}
              <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '15px 20px' }} />
              
              <Link to="/dashboard/carga-masiva" style={estilos.link}>
                <FaFileUpload style={estilos.icono} /> Carga Masiva
              </Link>
              <Link to="/dashboard/crear-usuario" style={estilos.link}>
                <FaUserCog style={estilos.icono} /> Crear Usuario
              </Link>
              <Link to="/dashboard/gestion-usuarios" style={estilos.link}>
                <FaUser style={estilos.icono} /> Gestionar Usuarios
              </Link>
              <Link to="/dashboard/gestion-aprendices" style={estilos.link}>
                <FaUserGraduate style={estilos.icono} /> Gestionar Aprendices
              </Link>
              {/* NUEVO BOTÓN: Enlace a la página externa de reportes */}
              <Link to="/reportes" style={estilos.link}>
                <FaChartBar style={estilos.icono} /> Ver Reportes
              </Link>
            </>
          )}
        </nav>

        <button onClick={cerrarSesion} style={estilos.botonSalir}>
          <FaSignOutAlt style={estilos.icono} /> Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main style={estilos.contenido}>
        <Outlet /> 
      </main>
    </div>
  );
};

// Estilos rápidos en línea (Sin cambios)
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