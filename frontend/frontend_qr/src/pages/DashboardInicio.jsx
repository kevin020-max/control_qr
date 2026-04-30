import { useState, useEffect } from 'react';
import { FaUserFriends, FaSignInAlt, FaSignOutAlt, FaUserPlus } from 'react-icons/fa';
import api from '../services/api'; // Asegúrate de que esta ruta sea correcta según tu estructura de carpetas

const DashboardInicio = () => {
  // 2. ESTADOS: Inicializamos los valores en 0 mientras el backend responde
  const [estadisticas, setEstadisticas] = useState({
    personasActivas: 0,
    ingresosHoy: 0,
    salidasHoy: 0,
    visitantesHoy: 0
  });

  // 3. EL EFECTO: Buscar los datos reales al cargar la pantalla
  useEffect(() => {
    // Creamos una función asíncrona interna para poder usar "await"
    const obtenerEstadisticas = async () => {
      try {
        // Hacemos la petición GET a la ruta que creamos en Node.js
        const respuesta = await api.get('/dashboard/resumen');
        
        // Si todo sale bien, actualizamos el estado con los datos reales
        // Recuerda que en nuestro backend enviamos: { status: 'success', data: { ... } }
        setEstadisticas(respuesta.data.data);
      } catch (error) {
        // Si hay un error (ej. el backend está apagado), lo mostramos en consola
        console.error('Error al cargar las estadísticas:', error);
      }
    };

    // Ejecutamos la función
    obtenerEstadisticas();
    
  }, []); // ¡MUY IMPORTANTE! Los corchetes vacíos [] significan "ejecuta esto SOLO UNA VEZ al abrir la pantalla"

  // 4. OBTENER FECHA ACTUAL EN ESPAÑOL
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaHoy = new Date().toLocaleDateString('es-ES', opcionesFecha);

  // 5. RENDERIZADO DE LA INTERFAZ
  return (
    <div style={estilos.contenedor}>
      
      {/* --- SECCIÓN DE CABECERA --- */}
      <div style={estilos.cabecera}>
        {/* Aquí luego pondremos el nombre dinámico del usuario logueado */}
        <h1 style={estilos.titulo}>Bienvenido, Juan Pérez</h1> 
        <p style={estilos.subtitulo}>{fechaHoy}</p>
      </div>

      {/* --- SECCIÓN DE TARJETAS DE RESUMEN --- */}
      <div style={estilos.gridTarjetas}>
        
        {/* Tarjeta 1: Personas Activas */}
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Personas Activas</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.personasActivas}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#dcfce7', color: '#16a34a'}}>
            <FaUserFriends style={estilos.icono} />
          </div>
        </div>

        {/* Tarjeta 2: Ingresos Hoy */}
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Ingresos Hoy</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.ingresosHoy}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#dbeafe', color: '#2563eb'}}>
            <FaSignInAlt style={estilos.icono} />
          </div>
        </div>

        {/* Tarjeta 3: Salidas Hoy */}
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Salidas Hoy</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.salidasHoy}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#ffedd5', color: '#ea580c'}}>
            <FaSignOutAlt style={estilos.icono} />
          </div>
        </div>

        {/* Tarjeta 4: Visitantes Hoy */}
        <div style={estilos.tarjeta}>
          <div>
            <p style={estilos.tituloTarjeta}>Visitantes Hoy</p>
            <h2 style={estilos.numeroTarjeta}>{estadisticas.visitantesHoy}</h2>
          </div>
          <div style={{...estilos.cajaIcono, backgroundColor: '#f3e8ff', color: '#9333ea'}}>
            <FaUserPlus style={estilos.icono} />
          </div>
        </div>

      </div>

      {/* Aquí abajo irán las listas de visitantes y registros en los siguientes pasos */}

    </div>
  );
};

// 4. ESTILOS CSS EN LÍNEA (Basados en tu prototipo visual)
const estilos = {
  contenedor: {
    padding: '30px',
    backgroundColor: '#f8fafc', // Fondo gris muy clarito
    minHeight: '100vh',
  },
  cabecera: {
    marginBottom: '30px',
  },
  titulo: {
    fontSize: '28px',
    color: '#0f172a',
    margin: '0 0 5px 0',
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#64748b',
    margin: 0,
    fontSize: '15px',
    textTransform: 'capitalize', // Para que la primera letra del día sea mayúscula
  },
  gridTarjetas: {
    display: 'grid',
    // Usamos CSS Grid para que las 4 tarjetas se adapten solas al ancho de la pantalla
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  tarjeta: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between', // Separa el texto a la izquierda y el ícono a la derecha
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  tituloTarjeta: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#64748b',
  },
  numeroTarjeta: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cajaIcono: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icono: {
    fontSize: '22px',
  }
};

export default DashboardInicio;