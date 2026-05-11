import { useState, useEffect } from 'react';
import api from '../services/api'; 
import { FaUserGraduate, FaPlus, FaBan, FaCheckCircle } from 'react-icons/fa'; // Íconos para la UI

const GestionAprendices = () => {
  // ==========================================================================
  // 1. ESTADOS DEL COMPONENTE
  // ==========================================================================
  const [aprendices, setAprendices] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estado para el formulario de creación manual
  const [formData, setFormData] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    id_ficha: '' // El usuario digitará el ID de la ficha por ahora
  });

  // ==========================================================================
  // 2. FUNCIONES DE LECTURA Y LÓGICA (CRUD)
  // ==========================================================================
  
  // LECTURA (READ)
  const obtenerAprendices = async () => {
    try {
      const respuesta = await api.get('/aprendices');
      setAprendices(respuesta.data.data);
    } catch (error) {
      mostrarMensaje('Error al cargar la lista de aprendices', 'error');
    } finally {
      setCargando(false);
    }
  };

  // Se ejecuta al cargar la página
  useEffect(() => {
    obtenerAprendices();
  }, []);

  // CREACIÓN (CREATE)
  const handleCrear = async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    try {
      // Aseguramos que los números se envíen como números al backend
      const payload = {
        ...formData,
        numero_documento: Number(formData.numero_documento),
        id_ficha: Number(formData.id_ficha)
      };

      const respuesta = await api.post('/aprendices/crear', payload);
      mostrarMensaje(respuesta.data.message, 'exito');
      
      // Limpiamos el formulario tras el éxito
      setFormData({ numero_documento: '', tipo_doc: 'CC', nombres: '', apellidos: '', id_ficha: '' });
      
      // Recargamos la tabla para ver al nuevo aprendiz
      obtenerAprendices();
    } catch (error) {
      const msjError = error.response?.data?.message || 'Error al crear el aprendiz';
      mostrarMensaje(msjError, 'error');
    }
  };

  // ACTUALIZAR ESTADO (SOFT DELETE)
  const cambiarEstado = async (id_persona, estadoActual) => {
    const nuevoEstado = estadoActual === 1 ? 2 : 1;
    try {
      await api.put(`/aprendices/${id_persona}/estado`, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 1 ? 'Aprendiz Activado' : 'Aprendiz Desactivado', 'exito');
      obtenerAprendices();
    } catch (error) {
      mostrarMensaje('Error al cambiar el estado', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  // ==========================================================================
  // 3. RENDERIZADO DE LA INTERFAZ (UI)
  // ==========================================================================
  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}><FaUserGraduate /> Gestión de Aprendices (Manual)</h2>
      
      {mensaje.texto && (
        <div style={mensaje.tipo === 'exito' ? estilos.alertaExito : estilos.alertaError}>
          {mensaje.texto}
        </div>
      )}

      {/* SECCIÓN 1: FORMULARIO DE REGISTRO MANUAL */}
      <div style={estilos.tarjeta}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Registrar Aprendiz Faltante</h3>
        <form onSubmit={handleCrear} style={estilos.formulario}>
          <select name="tipo_doc" value={formData.tipo_doc} onChange={handleChange} style={estilos.input} required>
            <option value="CC">CC</option>
            <option value="TI">TI</option>
            <option value="CE">CE</option>
          </select>
          <input type="number" name="numero_documento" placeholder="N° Documento" value={formData.numero_documento} onChange={handleChange} style={estilos.input} required />
          <input type="text" name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleChange} style={estilos.input} required />
          <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} style={estilos.input} required />
          <input type="number" name="id_ficha" placeholder="ID Ficha (Ej: 1)" value={formData.id_ficha} onChange={handleChange} style={estilos.input} required />
          
          <button type="submit" style={estilos.botonPrimario}>
            <FaPlus /> Agregar
          </button>
        </form>
      </div>

      {/* SECCIÓN 2: TABLA DE CONTROL */}
      <div style={estilos.tarjeta}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Directorio de Aprendices</h3>
        {cargando ? (
          <p>Cargando datos...</p>
        ) : (
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={estilos.th}>Documento</th>
                <th style={estilos.th}>Aprendiz</th>
                <th style={estilos.th}>Programa de Formación</th>
                <th style={estilos.th}>Estado</th>
                <th style={estilos.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {aprendices.map((ap) => (
                <tr key={ap.id_persona} style={{ backgroundColor: ap.tipo_estado === 2 ? '#fee2e2' : 'white' }}>
                  <td style={estilos.td}>{ap.tipo_doc} {ap.numero_documento}</td>
                  <td style={estilos.td}>{ap.nombres} {ap.apellidos}</td>
                  {/* Aquí mostramos el número y el nombre de la ficha que cruzamos en el Backend */}
                  <td style={estilos.td}><strong>{ap.numero_ficha}</strong> - {ap.nombre_programa}</td>
                  <td style={estilos.td}>
                    {ap.tipo_estado === 1 
                      ? <span style={estilos.badgeActivo}>Activo</span> 
                      : <span style={estilos.badgeInactivo}>Inactivo</span>}
                  </td>
                  <td style={estilos.td}>
                    <button 
                      onClick={() => cambiarEstado(ap.id_persona, ap.tipo_estado)}
                      style={ap.tipo_estado === 1 ? estilos.botonPeligro : estilos.botonExito}
                    >
                      {ap.tipo_estado === 1 ? <><FaBan /> Bloquear</> : <><FaCheckCircle /> Activar</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Estilos
const estilos = {
  contenedor: { padding: '20px', maxWidth: '1100px' },
  titulo: { color: '#39A900', borderBottom: '2px solid #ccc', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' },
  tarjeta: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' },
  formulario: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' },
  botonPrimario: { padding: '10px 20px', backgroundColor: '#39A900', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  tabla: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { backgroundColor: '#f3f4f6', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' },
  td: { padding: '12px', borderBottom: '1px solid #ddd' },
  badgeActivo: { backgroundColor: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  badgeInactivo: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  botonPeligro: { padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  botonExito: { padding: '8px 12px', backgroundColor: '#39A900', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  alertaExito: { backgroundColor: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' },
  alertaError: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }
};

export default GestionAprendices;