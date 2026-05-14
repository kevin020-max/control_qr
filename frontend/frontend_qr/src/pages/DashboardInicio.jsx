import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { FaUserFriends, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaHome, FaQrcode, FaFileUpload, FaUserCog, FaChartBar, FaUser, FaUserGraduate } from 'react-icons/fa';
import api from '../services/api';
import logoSena from '../assets/logoSena.png';
import '../styles/DashboardInicio.css'

const DashboardInicio = () => {
  // 2. ESTADO INICIAL
  // Iniciamos los contadores en 0 y las listas vacías para que la pantalla no falle mientras carga
  const [estadisticas, setEstadisticas] = useState({
    personasActivas: 0,
    ingresosHoy: 0,
    salidasHoy: 0,
    visitantesHoy: 0,
    listaVisitantes: [],       // Array para la lista naranja (Visitantes)
    registrosRecientes: []     // Array para la lista blanca (Aprendices, Instructores, etc.)
  });

  // 3. EFECTO DE CARGA (useEffect)
  // Se ejecuta una sola vez al abrir esta pantalla para traer los datos reales de MySQL
  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await api.get('/dashboard/resumen');
        // Actualizamos nuestro estado con la información que mandó Node.js
        setEstadisticas(respuesta.data.data);
      } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
      }
    };
    obtenerEstadisticas();
  }, []);

  const usuarioString = localStorage.getItem('usuario');
  // Usamos Number() para asegurar que la comparación con === funcione
  const usuarioObj = usuarioString ? JSON.parse(usuarioString) : null;
  const id_rol = usuarioObj ? Number(usuarioObj.id_rol) : null;

  // 4. FUNCIONES AYUDANTES (Helpers)

  // Obtener fecha actual en formato amigable (Ej: jueves, 30 de abril de 2026)
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaHoy = new Date().toLocaleDateString('es-ES', opcionesFecha);

  // Extraer solo la hora de un texto de fecha gigante
  const extraerHora = (fechaString) => {
    if (!fechaString) return '--:--';
    const fecha = new Date(fechaString);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Convertir el ID numérico del rol en un texto amigable para mostrar en pantalla
  const obtenerNombreRol = (tipo) => {
    // Estos roles dependen de cómo configuraste tu base de datos
    const roles = { 1: 'Aprendiz', 2: 'Instructor', 3: 'Funcionario', 4: 'Visitante' };
    return roles[tipo] || 'Otro';
  };

  const navigate = useNavigate();

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // Es buena práctica borrar también al usuario
    navigate('/login');
  };

  const location = useLocation();

  // Esta variable será verdadera SOLO cuando estés en la raíz del dashboard
  const esRutaInicio = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // 5. RENDERIZADO DE LA INTERFAZ
  return (
    <>
    <div className='contenedor'>
    {/* --- CABECERA --- */}
      <header>
        <div className='logo-sena'>
          <img src={logoSena} alt="Logo del SENA" />
            <div className='titulos'>
              <h1>SENA</h1>
              <h2>Control de acceso</h2>
            </div>
        </div>

        <div className='logout'>
          <div className='identidad'>
            <h1>Admin SENA</h1>
            <p>Administrador</p>
          </div>
          <button onClick={cerrarSesion} style={estilos.botonSalir}>Salir <FaSignOutAlt className='icono-link' /></button>
        </div>
      </header>

      <div className='cuerpo-dashboard'>
      {/* --- SIDEBAR --- */}
      <aside>

        <nav className='menu'>
          {/* BOTONES COMUNES: El inicio, el escáner y registrar visitante los ven el Admin y el Guarda */}
          <NavLink to="/dashboard" className='link' end>
            <FaHome className='icono-link' /> Inicio
          </NavLink>

          
          {id_rol === 2 && (
            <>
            <NavLink to="/dashboard/escaner" className='link'>
              <FaQrcode className='icono-link' /> Escáner QR
            </NavLink>
            <NavLink to="/dashboard/visitantes" className='link'>
              <FaUserPlus className='icono-link' /> Registrar Visitante
            </NavLink>
          </>
          )}

          {/* 3. LA MAGIA: RENDERIZADO CONDICIONAL */}
          {/* El código dentro de estos paréntesis SOLO se dibujará si id_rol es exactamente 1 */}
          {id_rol === 1 && (
            <>
              <NavLink to="/dashboard/carga-masiva" className='link'>
                <FaFileUpload className='icono-link' /> Carga Masiva
              </NavLink>
              <NavLink to="/dashboard/crear-usuario" className='link'>
                <FaUserCog className='icono-link' /> Crear Usuario
              </NavLink>
              <NavLink to="/dashboard/gestion-usuarios" className='link'>
                <FaUser className='icono-link' /> Gestionar Usuarios
              </NavLink>
              <NavLink to="/dashboard/gestion-aprendices" className='link'>
                <FaUserGraduate className='icono-link' /> Gestionar Aprendices
              </NavLink>
            </>
          )}

          {[1, 3, 4].includes(id_rol) && (
            <NavLink to="/dashboard/reportes" className='link'>
                  <FaChartBar className='icono-link' /> Ver Reportes
            </NavLink>
          )  
          }
        </nav>
      </aside>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
<main className='contenido'>
  <Outlet /> 
  
  {/* LA MAGIA: Si la ruta es exactamente /dashboard, muestra las tarjetas. 
      Si entras a /dashboard/visitantes, esRutaInicio será false y esto se ocultará */}
  
  {esRutaInicio && (
    <>
    <div className='titulos-contenido'>
      <h1>Bienvenido</h1>
      <p>{fechaHoy}</p>
    </div>
      {/* --- BLOQUE 1: TARJETAS DE RESUMEN --- */}
      <div className='grid-tarjetas'>
        <div className='tarjeta'>
          <div>
            <p className='titulo-tarjeta'>Personas Activas</p>
            <h2 className='numero-tarjeta'>{estadisticas.personasActivas}</h2>
          </div>
          <div ><FaUserFriends className='icono'/></div>
        </div>
        <div className='tarjeta'>
          <div>
            <p className='titulo-tarjeta'>Ingresos Hoy</p>
            <h2 className='numero-tarjeta'>{estadisticas.ingresosHoy}</h2>
          </div>
          <div ><FaSignInAlt className='icono'/></div>
        </div>
        <div className='tarjeta'>
          <div>
            <p className='titulo-tarjeta'>Salidas Hoy</p>
            <h2 className='numero-tarjeta'>{estadisticas.salidasHoy}</h2>
          </div>
          <div ><FaSignOutAlt className='icono'/></div>
        </div>
        <div className='tarjeta'>
          <div>
            <p className='titulo-tarjeta'>Visitantes Hoy</p>
            <h2 className='numero-tarjeta'>{estadisticas.visitantesHoy}</h2>
          </div>
          <div ><FaUserPlus className='icono'/></div>
        </div>
      </div>

    <div className='actividad-reciente'>
      <h2>Actividad reciente</h2>

      {/* --- BLOQUE 2: LISTA DE VISITANTES --- */}

          {estadisticas.listaVisitantes.length > 0 ? (
            estadisticas.listaVisitantes.map((visitante, index) => (
              <div key={index}>
                <div className='item-lista'>
                  <div className='caja-icono'>
                    <FaSignInAlt className='icono-lista'/>
                  </div>
                  <div>
                    <h4 style={estilos.nombrePersona}>{visitante.nombres} {visitante.apellidos}</h4>
                    <p style={estilos.textoSecundario}>Entrada • {extraerHora(visitante.fecha_entrada)}</p>
                    <p style={estilos.textoMotivo}>{visitante.observacion}</p>
                    <p style={estilos.textoExpiracion}>Expira: {extraerHora(visitante.fecha_expiracion)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={estilos.mensajeVacio}>No hay visitantes activos en este momento.</p>
          )}

      {/* --- BLOQUE 3: OTROS REGISTROS --- */}

          {estadisticas.registrosRecientes.length > 0 ? (
            estadisticas.registrosRecientes.map((registro, index) => {
              // Lógica para saber si la fila es una entrada o una salida
              const esSalida = registro.fecha_salida !== null;
              const horaMostrar = esSalida ? extraerHora(registro.fecha_salida) : extraerHora(registro.fecha_entrada);
              const tipoRegistro = esSalida ? 'Salida' : 'Entrada';

              return (
                <div key={index}>
                  <div className='item-lista'>
                    <div className='caja-icono' style={esSalida ? estilos.iconoSalida : estilos.iconoEntrada}>
                      {esSalida ? <FaSignOutAlt className='icono-lista' /> : <FaSignInAlt className='icono-lista' />}
                    </div>
                    <div>
                      <h4 style={estilos.nombrePersona}>{registro.nombres} {registro.apellidos}</h4>
                      <p style={estilos.textoMotivo}>
                        {obtenerNombreRol(registro.tipo_persona)} • {tipoRegistro}
                        <p style={estilos.textoSecundario}>{horaMostrar}</p>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={estilos.mensajeVacio}>No hay registros recientes.</p>
          )}
        </div>
    </>
  )}
</main>
</div>
    </div>
    </>
  );
};

// 6. ESTILOS CSS EN LÍNEA
const estilos = {
  botonSalir: {
    width: '117px',
    height: '48px',
    backgroundColor: '#ff0000',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex'
  },
};

export default DashboardInicio;