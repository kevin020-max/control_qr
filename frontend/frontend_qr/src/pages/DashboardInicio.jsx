import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { FaUserFriends, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaRegClock, FaHome, FaQrcode, FaFileUpload, FaUserCog, FaChartBar, FaUser, FaUserGraduate } from 'react-icons/fa';
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

  const location = useLocation();

  // Esta variable será verdadera SOLO cuando estés en la raíz del dashboard
  const esRutaInicio = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // 5. RENDERIZADO DE LA INTERFAZ
  return (
    <>
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
    <div className='contenedor'>

      {/* --- SIDEBAR --- */}
      <aside>

        <nav className='menu'>
          {/* BOTONES COMUNES: El inicio, el escáner y registrar visitante los ven el Admin y el Guarda */}
          <Link to="/dashboard" className='link'>
            <FaHome className='icono-link' /> Inicio
          </Link>

          
          {id_rol === 2 && (
            <>
            <Link to="/dashboard/escaner" className='link'>
              <FaQrcode className='icono-link' /> Escáner QR
            </Link>
            <Link to="/dashboard/visitantes" className='link'>
              <FaUserPlus className='icono-link' /> Registrar Visitante
            </Link>
          </>
          )}

          {/* 3. LA MAGIA: RENDERIZADO CONDICIONAL */}
          {/* El código dentro de estos paréntesis SOLO se dibujará si id_rol es exactamente 1 */}
          {id_rol === 1 && (
            <>
              {/* Usamos un pequeño separador visual opcional */}
              <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '15px 20px' }} />

              <Link to="/dashboard/carga-masiva" className='link'>
                <FaFileUpload className='icono-link' /> Carga Masiva
              </Link>
              <Link to="/dashboard/crear-usuario" className='link'>
                <FaUserCog className='icono-link' /> Crear Usuario
              </Link>
              <Link to="/dashboard/gestion-usuarios" className='link'>
                <FaUser className='icono-link' /> Gestionar Usuarios
              </Link>
              <Link to="/dashboard/gestion-aprendices" className='link'>
                <FaUserGraduate className='icono-link' /> Gestionar Aprendices
              </Link>
            </>
          )}

          {id_rol === 1 && 3 && 4 &&  (
            <>
              <Link to="/reportes" className='link'>
                  <FaChartBar className='icono-link' /> Ver Reportes
              </Link>
          </>
          )}
        </nav>
      </aside>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
<main className='contenido'>
  <Outlet /> 
  
  {/* LA MAGIA: Si la ruta es exactamente /dashboard, muestra las tarjetas. 
      Si entras a /dashboard/visitantes, esRutaInicio será false y esto se ocultará */}
  
  {esRutaInicio && (
    <>
      {/* --- BLOQUE 1: TARJETAS DE RESUMEN --- */}
      <div className='grid-tarjetas'>
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Personas Activas</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.personasActivas}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#dcfce7', color: '#16a34a'}}><FaUserFriends style={estilos.icono} /></div>
        </div>
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Ingresos Hoy</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.ingresosHoy}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#dbeafe', color: '#2563eb'}}><FaSignInAlt style={estilos.icono} /></div>
        </div>
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Salidas Hoy</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.salidasHoy}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#ffedd5', color: '#ea580c'}}><FaSignOutAlt style={estilos.icono} /></div>
        </div>
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Visitantes Hoy</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.visitantesHoy}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#f3e8ff', color: '#9333ea'}}><FaUserPlus style={estilos.icono} /></div>
        </div>
      </div>

      {/* --- BLOQUE 2: LISTA DE VISITANTES --- */}
      <div style={estilos.seccionListas}>
        <div style={estilos.cabeceraLista}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaRegClock style={{ color: '#ea580c', fontSize: '20px' }} />
            <h3 style={estilos.tituloLista}>Visitantes Activos</h3>
          </div>
          <span style={estilos.textoSecundario}>QR Temporal</span>
        </div>

        <div style={estilos.contenedorLista}>
          {estadisticas.listaVisitantes.length > 0 ? (
            estadisticas.listaVisitantes.map((visitante, index) => (
              <div key={index} style={estilos.itemVisitante}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={estilos.iconoEntrada}>
                    <FaSignInAlt />
                  </div>
                  <div>
                    <h4 style={estilos.nombrePersona}>{visitante.nombres} {visitante.apellidos}</h4>
                    <p style={estilos.textoSecundario}>Entrada • {extraerHora(visitante.fecha_entrada)}</p>
                    <p style={estilos.textoMotivo}>{visitante.observacion}</p>
                  </div>
                </div>
                <div style={estilos.cajaExpiracion}>
                  <p style={estilos.textoExpiracion}>Expira: {extraerHora(visitante.fecha_expiracion)}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={estilos.mensajeVacio}>No hay visitantes activos en este momento.</p>
          )}
        </div>
      </div>

      {/* --- BLOQUE 3: OTROS REGISTROS --- */}
      <div style={estilos.seccionListas}>
        <div style={estilos.cabeceraLista}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={estilos.tituloLista}>Otros Registros Recientes</h3>
          </div>
          <span style={estilos.textoSecundario}>Comunidad Educativa</span>
        </div>

        <div style={estilos.contenedorLista}>
          {estadisticas.registrosRecientes.length > 0 ? (
            estadisticas.registrosRecientes.map((registro, index) => {
              // Lógica para saber si la fila es una entrada o una salida
              const esSalida = registro.fecha_salida !== null;
              const horaMostrar = esSalida ? extraerHora(registro.fecha_salida) : extraerHora(registro.fecha_entrada);
              const tipoRegistro = esSalida ? 'Salida' : 'Entrada';

              return (
                <div key={index} style={estilos.itemRegistroNormal}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={esSalida ? estilos.iconoSalida : estilos.iconoEntrada}>
                      {esSalida ? <FaSignOutAlt /> : <FaSignInAlt />}
                    </div>
                    <div>
                      <h4 style={estilos.nombrePersona}>{registro.nombres} {registro.apellidos}</h4>
                      <p style={estilos.textoMotivo}>
                        {obtenerNombreRol(registro.tipo_persona)} • {tipoRegistro}
                      </p>
                    </div>
                  </div>
                  <div style={estilos.cajaExpiracion}>
                    <p style={estilos.textoSecundario}><FaRegClock style={{marginRight: '5px'}}/> {horaMostrar}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={estilos.mensajeVacio}>No hay registros recientes.</p>
          )}
        </div>
      </div>
    </>
  )}
</main>
    </div>
    </>
  );
};

// 6. ESTILOS CSS EN LÍNEA
const estilos = {
  // Estructura General
  titulo: { fontSize: '28px', color: '#0f172a', margin: '0 0 5px 0', fontWeight: 'bold' },
  subtitulo: { color: '#64748b', margin: 0, fontSize: '15px', textTransform: 'capitalize' },
  
  // Grid de Tarjetas (Bloque 1)
  gridTarjetas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' },
  tarjeta: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  tituloTarjeta: { margin: '0 0 5px 0', fontSize: '13px', color: '#64748b' },
  numeroTarjeta: { margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0f172a' },
  cajaIcono: { width: '45px', height: '45px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  icono: { fontSize: '22px' },

  // Estilos comunes para las listas (Bloque 2 y 3)
  seccionListas: { marginTop: '20px', marginBottom: '30px' },
  cabeceraLista: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  tituloLista: { margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' },
  contenedorLista: { display: 'flex', flexDirection: 'column', gap: '15px' },
  nombrePersona: { margin: '0 0 3px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' },
  textoSecundario: { margin: '0 0 3px 0', fontSize: '13px', color: '#64748b' },
  textoMotivo: { margin: 0, fontSize: '13px', color: '#94a3b8' },
  cajaExpiracion: { textAlign: 'right' },
  textoExpiracion: { margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 'bold' },
  mensajeVacio: { textAlign: 'center', color: '#64748b', padding: '20px 0' },

  // Diseño específico para Visitantes (Naranja)
  itemVisitante: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '15px', borderRadius: '10px' },
  
  // Diseño específico para Registros Normales (Blanco)
  itemRegistroNormal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '10px' },
  
  // Cajas de íconos para Entradas y Salidas en las listas
  iconoEntrada: { backgroundColor: '#dcfce7', color: '#16a34a', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' },
  iconoSalida: { backgroundColor: '#ffedd5', color: '#ea580c', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }
};

export default DashboardInicio;