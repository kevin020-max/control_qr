// src/pages/GestionAprendices.jsx
import { useState, useEffect } from 'react';
import api from '../services/api'; 
import { FaUserGraduate, FaPlus, FaBan, FaCheckCircle, FaGraduationCap } from 'react-icons/fa';
import '../styles/GestionAprendices.css'; // Importamos la nueva hoja de estilos

const GestionAprendices = () => {
  // 1. ESTADOS DEL COMPONENTE
  const [aprendices, setAprendices] = useState([]);
  const [fichas, setFichas] = useState([]); // <-- NUEVO: Guarda las fichas de MySQL
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estado del formulario (id_ficha inicializa vacío)
  const [formData, setFormData] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    id_ficha: '' // <-- Se controlará con el Dropdown selectivo
  });

  // 2. PETICIONES AL BACKEND (CRUD)
  const obtenerDatosIniciales = async () => {
    try {
      // Ejecutamos ambas peticiones al tiempo para optimizar la velocidad de carga
      const [resAprendices, resFichas] = await Promise.all([
        api.get('/aprendices'),
        api.get('/fichas')
      ]);

      setAprendices(resAprendices.data.data || []);
      setFichas(resFichas.data.data || []); // Cargamos las fichas reales en el estado

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
      obtenerDatosIniciales(); // Recargamos tablas de forma limpia
    } catch (error) {
      const msjError = error.response?.data?.message || 'Error al crear el aprendiz';
      mostrarMensaje(msjError, 'error');
    }
  };

  const cambiarEstado = async (id_persona, estadoActual) => {
    const nuevoEstado = estadoActual === 1 ? 2 : 1;
    try {
      await api.put(`/aprendices/${id_persona}/estado`, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 1 ? 'Aprendiz Activado' : 'Aprendiz Desactivado', 'exito');
      obtenerDatosIniciales();
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

      {/* SECCIÓN 1: FORMULARIO DE REGISTRO MANUAL CON EL SECTOR DE FICHA (FIGMA) */}
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
          
          {/* CAMBIO CLAVE: Cambiamos el input numérico por este Dropdown dinámico */}
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

      {/* SECCIÓN 2: TABLA DE CONTROL IDENTICA A LA DE ROLES */}
      <div className="tarjeta-panel-sena">
        <h3 className="titulo-tabla-seccion">Directorio de Aprendices</h3>
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
              {aprendices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="txt-centro-sena fila-vacia">No hay aprendices registrados manualmente en el sistema.</td>
                </tr>
              ) : (
                aprendices.map((ap) => (
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
                        onClick={() => cambiarEstado(ap.id_persona, ap.tipo_estado)}
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
    </div>
  );
};

export default GestionAprendices;