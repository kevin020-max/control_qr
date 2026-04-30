// src/pages/DashboardInicio.jsx

// 1. IMPORTACIONES
import { useState, useEffect } from 'react';
// Importamos los íconos necesarios para la interfaz
import { FaUserFriends, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaRegClock } from 'react-icons/fa';
// Importamos nuestra instancia de axios configurada para hacer peticiones al backend
import api from '../services/api';

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

  // 5. RENDERIZADO DE LA INTERFAZ
  return (
    <div style={estilos.contenedor}>
      
      {/* --- CABECERA --- */}
      <div style={estilos.cabecera}>
        <h1 style={estilos.titulo}>Bienvenido al Sistema</h1> 
        <p style={estilos.subtitulo}>{fechaHoy}</p>
      </div>

      {/* --- BLOQUE 1: TARJETAS DE RESUMEN (KPIs) --- */}
      <div style={estilos.gridTarjetas}>
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

      {/* --- BLOQUE 2: LISTA DE VISITANTES ACTIVOS (Tema Naranja) --- */}
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

      {/* --- BLOQUE 3: REGISTROS RECIENTES APRENDICES/INSTRUCTORES (Tema Blanco) --- */}
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

    </div>
  );
};

// 6. ESTILOS CSS EN LÍNEA
const estilos = {
  // Estructura General
  contenedor: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  cabecera: { marginBottom: '30px' },
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