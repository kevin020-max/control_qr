import { useState, useEffect } from 'react';


import {
  useNavigate,
  Outlet,
  useLocation,
  NavLink,
  Link,
  Navigate
} from 'react-router-dom';

import {
  FaUserFriends,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserPlus,
  FaHome,
  FaQrcode,
  FaFileUpload,
  FaUserCog,
  FaChartBar,
  FaUser,
  FaUserGraduate,
  FaBell,
  FaClipboardList,
  FaHashtag,
  FaBars,
  FaTimes
} from 'react-icons/fa';

import api from '../services/api';
import logoSena from '../assets/logoSena.png';

import '../styles/DashboardInicio.css';

const DashboardInicio = () => {

  const [estadisticas, setEstadisticas] = useState({
    personasActivas: 0,
    ingresosHoy: 0,
    salidasHoy: 0,
    visitantesHoy: 0,
    listaVisitantes: [],
    registrosRecientes: []
  });

  useEffect(() => {

    const obtenerEstadisticas = async () => {

      try {

        const respuesta = await api.get(
          '/dashboard/resumen'
        );

        setEstadisticas(
          respuesta.data.data
        );

      } catch (error) {

        console.error(
          'Error al cargar estadísticas:',
          error
        );
      }
    };

    obtenerEstadisticas();

    const intervalo = setInterval(() => {

      obtenerEstadisticas();

    }, 3000);

    return () => clearInterval(intervalo);

  }, []);

  const usuarioString = localStorage.getItem(
    'usuario'
  );

  const usuarioObj = usuarioString
    ? JSON.parse(usuarioString)
    : null;

  const id_rol = usuarioObj
    ? Number(usuarioObj.id_rol)
    : null;

  const navigate = useNavigate();

  const location = useLocation();

  const esInstructor =
    id_rol === 3;

  const esCoordinador =
    id_rol === 4;

  useEffect(() => {

    if (
      esInstructor &&
      (
        location.pathname === '/dashboard' ||
        location.pathname === '/dashboard/'
      )
    ) {

      navigate('/dashboard/asistencia');

    }

  }, [
    esInstructor,
    location.pathname,
    navigate
  ]);

  const opcionesFecha = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const fechaHoy = new Date()
    .toLocaleDateString(
      'es-ES',
      opcionesFecha
    );

  const extraerHora = (fechaString) => {

    if (!fechaString) return '--:--';

    const fecha = new Date(fechaString);

    return fecha.toLocaleTimeString(
      'es-ES',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  const obtenerNombreRol = (tipo) => {

    const roles = {
      1: 'Administrador Total',
      2: 'Operario / Guarda',
      3: 'Instructor',
      4: 'Coordinador'
    };

    return roles[tipo] || 'Usuario';
  };

  const obtenerTipoPersonaTexto = (tipo) => {

    const tipos = {
      1: 'Aprendiz',
      2: 'Instructor',
      3: 'Funcionario',
      4: 'Visitante'
    };

    return tipos[tipo] || 'Usuario';
  };

  const cerrarSesion = () => {

    localStorage.removeItem('token');

    localStorage.removeItem('usuario');

    navigate('/login');
  };

  const esRutaInicio =
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/';

    const [menuAbierto, setMenuAbierto] = useState(false);

  return (

    <div className='contenedor'>

      <header>

      <button
          className='btn-menu'
          onClick={() => setMenuAbierto(true)}
        >
          <FaBars />
      </button>

        <div className='logo-sena'>

          <img
            src={logoSena}
            alt="Logo del SENA"
          />

          <div className='titulos'>

            <h1>SENA</h1>

            <h2>
              Control de acceso
            </h2>

          </div>

        </div>

        <div className='logout'>

          <div className='identidad'>

            <h1>
              {usuarioObj?.nombres}
              {' '}
              {usuarioObj?.apellidos || ''}
            </h1>

            <p>
              {obtenerNombreRol(id_rol)}
            </p>

          </div>

          <button
            onClick={cerrarSesion}
            style={estilos.botonSalir}
          >

            Salir

            <FaSignOutAlt className='icono-link' />

          </button>

        </div>

      </header>

          {
      menuAbierto && (
        <div
          className='overlay-menu'
          onClick={() => setMenuAbierto(false)}
        />
      )
    }

      <div className='cuerpo-dashboard'>

        <aside className={menuAbierto ? 'menu-abierto' : ''}>

          <button
          className='btn-cerrar-menu'
          onClick={() => setMenuAbierto(false)}
        >
          <FaTimes />
        </button>

          <nav className='menu'>

            {esInstructor ? (

              <NavLink
                to="/dashboard/asistencia"
                className='link'
              >

                <FaChartBar className='icono-link' />

                Asistencia

              </NavLink>

            ) : (

              <>

                <NavLink
                  to="/dashboard"
                  className='link'
                  end
                >

                  <FaHome className='icono-link' />

                  Inicio

                </NavLink>

                {id_rol === 2 && (
                  <>

                    <NavLink
                      to="/dashboard/escaner"
                      className='link'
                    >

                      <FaQrcode className='icono-link' />

                      Escáner QR

                    </NavLink>

                    <NavLink
                      to="/dashboard/visitantes"
                      className='link'
                    >

                      <FaUserPlus className='icono-link' />

                      Registrar Visitante

                    </NavLink>

                    <NavLink
                      to="/dashboard/alertas"
                      className='link'
                    >

                      <FaBell className='icono-link' />

                      Alertas

                    </NavLink>

                  </>
                )}

                {[2].includes(id_rol) && (

                  <NavLink
                    to="/dashboard/registro-accesos"
                    className='link'
                  >

                    <FaClipboardList className='icono-link' />

                    Registro Accesos

                  </NavLink>

                )}

                {id_rol === 1 && (
                  <>

                    <NavLink
                      to="/dashboard/carga-masiva"
                      className='link'
                    >

                      <FaFileUpload className='icono-link' />

                      Carga Masiva

                    </NavLink>

                    <NavLink
                      to="/dashboard/crear-usuario"
                      className='link'
                    >

                      <FaUserCog className='icono-link' />

                      Crear Usuario

                    </NavLink>

                    <NavLink
                      to="/dashboard/gestion-usuarios"
                      className='link'
                    >

                      <FaUser className='icono-link' />

                      Gestionar Usuarios

                    </NavLink>

                    <NavLink
                      to="/dashboard/gestion-aprendices"
                      className='link'
                    >

                      <FaUserGraduate className='icono-link' />

                      Gestionar Aprendices

                    </NavLink>

                    <NavLink
                      to="/dashboard/gestion-fichas"
                      className='link'
                    >

                      <FaHashtag className='icono-link' />

                      Gestionar Fichas

                    </NavLink>

                    <NavLink
                      to="/dashboard/reportes"
                      className='link'
                    >

                      <FaChartBar className='icono-link' />

                      Ver Reportes

                    </NavLink>

                  </>
                )}

                {id_rol === 4 && (

                  <NavLink
                    to="/dashboard/reportes"
                    className='link'
                  >

                    <FaChartBar className='icono-link' />

                    Ver Reportes

                  </NavLink>

                )}

              </>

            )}

          </nav>

        </aside>

        <main className='contenido'>

          <Outlet />

          {!esInstructor && esRutaInicio && (

            <>

              <div className='titulos-contenido'>

                <h1>

                  Bienvenido,
                  {' '}
                  {usuarioObj?.nombres}
                  {' '}
                  {usuarioObj?.apellidos || ''}

                </h1>

                <p>{fechaHoy}</p>

              </div>

              <div className='grid-tarjetas'>

                <div className='tarjeta'>

                  <div>

                    <p className='titulo-tarjeta'>
                      Personas Activas
                    </p>

                    <h2 className='numero-tarjeta'>
                      {estadisticas.personasActivas}
                    </h2>

                  </div>

                  <FaUserFriends className='icono' />

                </div>

                <div className='tarjeta'>

                  <div>

                    <p className='titulo-tarjeta'>
                      Ingresos Hoy
                    </p>

                    <h2 className='numero-tarjeta'>
                      {estadisticas.ingresosHoy}
                    </h2>

                  </div>

                  <FaSignInAlt className='icono' />

                </div>

                <div className='tarjeta'>

                  <div>

                    <p className='titulo-tarjeta'>
                      Salidas Hoy
                    </p>

                    <h2 className='numero-tarjeta'>
                      {estadisticas.salidasHoy}
                    </h2>

                  </div>

                  <FaSignOutAlt className='icono' />

                </div>

                <div className='tarjeta'>

                  <div>

                    <p className='titulo-tarjeta'>
                      Visitantes Hoy
                    </p>

                    <h2 className='numero-tarjeta'>
                      {estadisticas.visitantesHoy}
                    </h2>

                  </div>

                  <FaUserPlus className='icono' />

                </div>

              </div>

              <div className='actividad-reciente'>

                <div className='acceso-directo'>

                  <h2>
                    Actividad reciente
                  </h2>

                  <Link
                    to="/dashboard/registro-accesos"
                    className="link-ver-todos"
                  >

                    Ver todos

                  </Link>

                </div>

                {estadisticas.registrosRecientes.map(
                  (registro, index) => {

                    const esSalida =
                      registro.fecha_salida !== null;

                    const horaMostrar = esSalida
                      ? extraerHora(registro.fecha_salida)
                      : extraerHora(registro.fecha_entrada);

                    return (

                      <div
                        key={index}
                        className='item-lista'
                      >

                        <div className='caja-icono'>

                          {esSalida
                            ? <FaSignOutAlt className='icono-lista' />
                            : <FaSignInAlt className='icono-lista' />
                          }

                        </div>

                        <div>

                          <h4>

                            {registro.nombres}
                            {' '}
                            {registro.apellidos}

                          </h4>

                          <p>

                            {obtenerTipoPersonaTexto(
                              registro.tipo_persona
                            )}

                            {' • '}

                            {esSalida
                              ? 'Salida'
                              : 'Entrada'
                            }

                            {' — '}

                            {horaMostrar}

                          </p>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </>

          )}

        </main>

      </div>

    </div>
  );
};

const estilos = {};

export default DashboardInicio;