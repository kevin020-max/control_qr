// src/pages/GestionAprendices.jsx
import { useState, useEffect } from 'react';
import api from '../services/api'; 
import { FaUserGraduate, FaPlus, FaBan, FaCheckCircle, FaGraduationCap, FaFilter, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import '../styles/GestionAprendices.css'; 

const GestionAprendices = () => {
  // 1. ESTADOS DEL COMPONENTE
  const [aprendices, setAprendices] = useState([]);
  const [fichas, setFichas] = useState([]); 
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // --- NUEVOS FILTROS COMBINADOS ---
  const [filtroFicha, setFiltroFicha] = useState('');
  const [busqueda, setBusqueda] = useState(''); // <-- NUEVO: Estado para el buscador individual

  // Estado para el modal de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({
    visible: false,
    id_persona: null,
    estadoActual: null,
    nombreAprendiz: ''
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    id_ficha: '' 
  });

  // 2. PETICIONES AL BACKEND (CRUD)
  const obtenerDatosIniciales = async () => {
    try {
      const [resAprendices, resFichas] = await Promise.all([
        api.get('/aprendices'),
        api.get('/fichas')
      ]);

      setAprendices(resAprendices.data.data || []);
      setFichas(resFichas.data.data || []); 

    } catch (error) {
      console.error(error);
      mostrarMensaje('Error al sincronizar datos con el servidor', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!formData.id_ficha) {
      return mostrarMensaje('Por favor seleccione una ficha de formación válida.', 'error');
    }

    try {
      const payload = {
        ...formData,
        numero_documento: Number(formData.numero_documento),
        id_ficha: Number(formData.id_ficha)
      };

      const respuesta = await api.post('/aprendices/crear', payload);
      mostrarMensaje(respuesta.data.message || 'Aprendiz registrado.', 'exito');
      
      setFormData({ numero_documento: '', tipo_doc: 'CC', nombres: '', apellidos: '', id_ficha: '' });
      obtenerDatosIniciales(); 
    } catch (error) {
      const msjError = error.response?.data?.message || 'Error al crear el aprendiz';
      mostrarMensaje(msjError, 'error');
    }
  };

  const solicitarCambioEstado = (ap) => {
    setModalConfirmacion({
      visible: true,
      id_persona: ap.id_persona,
      estadoActual: ap.tipo_estado,
      nombreAprendiz: `${ap.nombres} ${ap.apellidos}`
    });
  };

  const procesarCambiarEstado = async () => {
    const { id_persona, estadoActual } = modalConfirmacion;
    const nuevoEstado = estadoActual === 1 ? 2 : 1;

    setModalConfirmacion({ visible: false, id_persona: null, estadoActual: null, nombreAprendiz: '' });

    try {
      await api.put(`/aprendices/${id_persona}/estado`, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 1 ? 'Acceso de Aprendiz Activado' : 'Acceso de Aprendiz Bloqueado', 'exito');
      obtenerDatosIniciales();
    } catch (error) {
      mostrarMensaje('Error al cambiar el estado del aprendiz', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  // --- LÓGICA DE FILTRADO DOBLE / COMBINADO ---
  const aprendicesFiltrados = aprendices.filter(ap => {
    // 1. Filtro por Ficha de caracterización
    const pasaFicha = !filtroFicha || Number(ap.id_ficha) === Number(filtroFicha);

    // 2. Filtro por caja de texto de búsqueda individual
    const termino = busqueda.toLowerCase().trim();
    const nombreCompleto = `${ap.nombres} ${ap.apellidos}`.toLowerCase();
    const documento = ap.numero_documento.toString();
    const pasaBusqueda = !termino || nombreCompleto.includes(termino) || documento.includes(termino);

    // Deben cumplirse ambos filtros a la vez
    return pasaFicha && pasaBusqueda;
  });

  return (
    <div className="modulo-gestion-aprendices">
      <div className="encabezado-aprendices">
        <h2><FaUserGraduate /> Gestión de Aprendices (Manual)</h2>
        <p>Registre y administre el estado de ingreso de los estudiantes vinculados al centro.</p>
      </div>
      
      {mensaje.texto && (
        <div className={`alerta-aprendices ${mensaje.tipo}`}>
          {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaBan />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* SECCIÓN 1: FORMULARIO DE REGISTRO MANUAL */}
      <div className="tarjeta-panel-sena">
        <h3>Registrar Aprendiz Faltante</h3>
        <form onSubmit={handleCrear} className="formulario-horizontal-sena">
          <select name="tipo_doc" value={formData.tipo_doc} onChange={handleChange} className="input-tabla-sena select-doc" required>
            <option value="CC">CC</option>
            <option value="TI">TI</option>
            <option value="CE">CE</option>
          </select>
          
          <input type="number" name="numero_documento" placeholder="N° Documento" value={formData.numero_documento} onChange={handleChange} className="input-tabla-sena" required />
          <input type="text" name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleChange} className="input-tabla-sena" required />
          <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} className="input-tabla-sena" required />
          
          <select name="id_ficha" value={formData.id_ficha} onChange={handleChange} className="input-tabla-sena select-ficha-dinamico" required>
            <option value="">Seleccione Ficha...</option>
            {fichas.map((f) => (
              <option key={f.id_ficha} value={f.id_ficha}>
                {f.numero_ficha} - {f.nombre}
              </option>
            ))}
          </select>
          
          <button type="submit" className="btn-sena-agregar">
            <FaPlus /> Agregar
          </button>
        </form>
      </div>

      {/* SECCIÓN 2: TABLA DE CONTROL CON FILTROS EN LÍNEA */}
      <div className="tarjeta-panel-sena">
        <div className="caja-tabla-header-con-filtro">
          <h3 className="titulo-tabla-seccion" style={{ margin: 0 }}>Directorio de Aprendices</h3>
          
          {/* --- BLOQUE DE CONTROLES (BÚSQUEDA Y FILTRADO) --- */}
          <div className="grupo-controles-filtrado-aprendices">
            
            {/* NUEVO: Buscador Individual por Texto */}
            <div className="contenedor-busqueda-individual-sena">
              <FaSearch className="icono-buscar-input-aprendiz" />
              <input 
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-buscar-individual-aprendiz"
              />
            </div>

            {/* Dropdown de Filtrado por Ficha */}
            <div className="contenedor-filtro-sena-fichas">
              <FaFilter className="icono-filtro-input" />
              <select 
                value={filtroFicha} 
                onChange={(e) => setFiltroFicha(e.target.value)}
                className="select-filtro-ficha-tabla"
              >
                <option value="">Mostrar Todas las Fichas</option>
                {fichas.map(f => (
                  <option key={f.id_ficha} value={f.id_ficha}>Ficha: {f.numero_ficha}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {cargando ? (
          <div className="cargando-tabla-sena">Sincronizando base de datos de aprendices...</div>
        ) : (
          <table className="tabla-gestion-sena">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Aprendiz</th>
                <th>Programa de Formación</th>
                <th>Estado</th>
                <th className="txt-centro-sena">Acción</th>
              </tr>
            </thead>
            <tbody>
              {aprendicesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="txt-centro-sena fila-vacia">No se encontraron aprendices coincidentes con los filtros aplicados.</td>
                </tr>
              ) : (
                aprendicesFiltrados.map((ap) => (
                  <tr key={ap.id_persona} className={ap.tipo_estado === 2 ? 'fila-desactivada' : ''}>
                    <td className="txt-documento-sena">{ap.tipo_doc} {ap.numero_documento}</td>
                    <td className="txt-nombre-sena">{ap.nombres} {ap.apellidos}</td>
                    <td>
                      <div className="programa-celda">
                        <FaGraduationCap className="icono-cap-sena" />
                        <span><strong>{ap.numero_ficha}</strong> - {ap.nombre_programa || ap.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-sena-status ${ap.tipo_estado === 1 ? 'activo' : 'inactivo'}`}>
                        {ap.tipo_estado === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="txt-centro-sena">
                      <button 
                        onClick={() => solicitarCambioEstado(ap)} 
                        className={`btn-tabla-sena-accion ${ap.tipo_estado === 1 ? 'bloquear' : 'restaurar'}`}
                      >
                        {ap.tipo_estado === 1 ? 'Bloquear' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ============================================================================
          MODAL CORPORATIVO DE CONFIRMACIÓN DE ACCESO DE APRENDICES
          ============================================================================ */}
      {modalConfirmacion.visible && (
        <div className="overlay-modal-sena">
          <div className="tarjeta-modal-sena">
            <div className={`encabezado-modal-alerta ${modalConfirmacion.estadoActual === 1 ? 'alerta-roja' : 'alerta-verde'}`}>
              <FaExclamationTriangle className="icono-modal-sena-aviso" />
              <h3>Confirmar Estado de Aprendiz</h3>
            </div>
            
            <div className="cuerpo-modal-sena">
              <p>¿Está seguro de que desea modificar los permisos de ingreso para el siguiente estudiante institucional?</p>
              <div className="info-usuario-modal-caja">
                <strong>{modalConfirmacion.nombreAprendiz}</strong>
                <span>Acción: {modalConfirmacion.estadoActual === 1 ? 'Bloquear Entrada Automática' : 'Reactivar Entrada / Validar QR'}</span>
              </div>
              <p className="txt-advertencia-sub">
                {modalConfirmacion.estadoActual === 1 
                  ? 'Esta restricción se aplicará en tiempo real. Cuando el aprendiz intente pasar su código QR en las porterías, el escáner se tornará rojo denegándole el ingreso físico al Centro.'
                  : 'Esta acción restaurará el estado activo del estudiante habilitando la generación de sus credenciales y accesos normales.'}
              </p>
            </div>

            <div className="pie-modal-sena">
              <button 
                className="btn-modal-sena-cancelar" 
                onClick={() => setModalConfirmacion({ visible: false, id_persona: null, estadoActual: null, nombreAprendiz: '' })}
              >
                Cancelar
              </button>
              <button 
                className={`btn-modal-sena-confirmar ${modalConfirmacion.estadoActual === 1 ? 'confirmar-bloqueo' : 'confirmar-activacion'}`}
                onClick={procesarCambiarEstado}
              >
                Sí, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAprendices;