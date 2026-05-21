// src/pages/GestionFichas.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaIdCard, FaPlus, FaCheckCircle, FaExclamationCircle, FaListUl, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import '../styles/GestionFichas.css';

const GestionFichas = () => {
  // 1. ESTADOS GENERALES
  const [fichas, setFichas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // Estado para crear nueva ficha
  const [formData, setFormData] = useState({ numero_ficha: '', nombre: '' });

  // 2. ESTADOS PARA EDICIÓN EN LÍNEA
  const [idFichaEditando, setIdFichaEditando] = useState(null); // Almacena el ID de la fila que se está editando
  const [editFormData, setEditFormData] = useState({ numero_ficha: '', nombre: '' });

  // 3. OBTENER LISTADO (READ)
  const obtenerFichas = async () => {
    try {
      const respuesta = await api.get('/fichas');
      setFichas(respuesta.data.data || []);
    } catch (error) {
      console.error(error);
      mostrarMensaje('Error al sincronizar con el servidor.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerFichas();
  }, []);

  // 4. CREAR FICHA (CREATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await api.post('/fichas', formData);
      mostrarMensaje(respuesta.data.message || 'Ficha registrada.', 'exito');
      setFormData({ numero_ficha: '', nombre: '' });
      obtenerFichas();
    } catch (error) {
      mostrarMensaje(error.response?.data?.message || 'Error al guardar.', 'error');
    }
  };

  // 5. PREPARAR EDICIÓN (Activa los inputs en la fila elegida)
  const iniciarEdicion = (ficha) => {
    setIdFichaEditando(ficha.id_ficha);
    setEditFormData({ numero_ficha: ficha.numero_ficha, nombre: ficha.nombre });
  };

  const cancelarEdicion = () => {
    setIdFichaEditando(null);
    setEditFormData({ numero_ficha: '', nombre: '' });
  };

  // 6. GUARDAR EDICIÓN (UPDATE)
  const handleGuardarCambios = async (id_ficha) => {
    try {
      const respuesta = await api.put(`/fichas/${id_ficha}`, editFormData);
      mostrarMensaje(respuesta.data.message || 'Ficha actualizada.', 'exito');
      setIdFichaEditando(null); // Cerramos el modo edición
      obtenerFichas(); // Recargamos datos
    } catch (error) {
      mostrarMensaje(error.response?.data?.message || 'Error al actualizar.', 'error');
    }
  };

  // 7. ELIMINAR FICHA (DELETE)
  const handleEliminar = async (id_ficha, numero_ficha) => {
    if (!window.confirm(`¿Está seguro de eliminar permanentemente la ficha ${numero_ficha}?`)) return;

    try {
      const respuesta = await api.delete(`/fichas/${id_ficha}`);
      mostrarMensaje(respuesta.data.message || 'Ficha eliminada.', 'exito');
      obtenerFichas();
    } catch (error) {
      mostrarMensaje(error.response?.data?.message || 'No se pudo eliminar.', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  return (
    <div className="modulo-gestion-fichas">
      <div className="encabezado-fichas">
        <h2><FaIdCard /> Gestión de Fichas SENA</h2>
        <p>Administre los códigos de fichas y los programas de formación tecnológica e institucional.</p>
      </div>

      {mensaje.texto && (
        <div className={`alerta-fichas ${mensaje.tipo}`}>
          {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* PANEL DE REGISTRO */}
      <div className="tarjeta-ficha-panel">
        <h3>Registrar Nueva Ficha de Formación</h3>
        <form onSubmit={handleSubmit} className="formulario-ficha-layout">
          <div className="grupo-input-ficha input-corto">
            <label>Número de Ficha</label>
            <input 
              type="number" 
              name="numero_ficha" 
              placeholder="Ej: 2758231" 
              value={formData.numero_ficha} 
              onChange={(e) => setFormData({ ...formData, numero_ficha: e.target.value })} 
              className="input-sena-ficha" 
              required 
            />
          </div>

          <div className="grupo-input-ficha">
            <label>Nombre del Programa de Formación</label>
            <input 
              type="text" 
              name="nombre" 
              placeholder="Ej: Análisis y Desarrollo de Software (ADSO)" 
              value={formData.nombre} 
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
              className="input-sena-ficha" 
              required 
            />
          </div>

          <button type="submit" className="btn-sena-ficha-agregar">
            <FaPlus /> Crear Ficha
          </button>
        </form>
      </div>

      {/* PANEL DIRECTORIO / TABLA */}
      <div className="tarjeta-ficha-panel">
        <h3 className="titulo-lista-fichas"><FaListUl /> Fichas Registradas en el Sistema</h3>
        
        {cargando ? (
          <div className="cargando-fichas-txt">Consultando las fichas académicas con MySQL...</div>
        ) : (
          <table className="tabla-fichas-sena">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th style={{ width: '180px' }}>Número de Ficha</th>
                <th>Programa de Formación Vinculado</th>
                <th className="txt-centro-ficha" style={{ width: '220px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fichas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="fila-fichas-vacia">No hay fichas creadas en la base de datos actualmente.</td>
                </tr>
              ) : (
                fichas.map((ficha) => (
                  <tr key={ficha.id_ficha}>
                    <td className="txt-id-gris">#{ficha.id_ficha}</td>
                    
                    {/* VALIDACIÓN: ¿Esta fila se está editando? */}
                    {idFichaEditando === ficha.id_ficha ? (
                      <>
                        {/* Celda editable del número */}
                        <td>
                          <input 
                            type="number" 
                            value={editFormData.numero_ficha} 
                            onChange={(e) => setEditFormData({ ...editFormData, numero_ficha: e.target.value })}
                            className="input-edicion-celda text-bold-input"
                          />
                        </td>
                        {/* Celda editable del programa */}
                        <td>
                          <input 
                            type="text" 
                            value={editFormData.nombre} 
                            onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                            className="input-edicion-celda"
                          />
                        </td>
                        {/* Botones de guardar/cancelar */}
                        <td className="txt-centro-ficha">
                          <div className="caja-botones-acciones">
                            <button onClick={() => handleGuardarCambios(ficha.id_ficha)} className="btn-accion-tabla guardar-btn" title="Guardar">
                              <FaSave /> Guardar
                            </button>
                            <button onClick={cancelarEdicion} className="btn-accion-tabla cancelar-btn" title="Cancelar">
                              <FaTimes /> Cancelar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Fila en modo lectura normal */}
                        <td className="txt-numero-ficha-bold">{ficha.numero_ficha}</td>
                        <td className="txt-nombre-programa-sena">{ficha.nombre}</td>
                        <td className="txt-centro-ficha">
                          <div className="caja-botones-acciones">
                            <button onClick={() => iniciarEdicion(ficha)} className="btn-accion-tabla editar-btn">
                              <FaEdit /> Editar
                            </button>
                            <button onClick={() => handleEliminar(ficha.id_ficha, ficha.numero_ficha)} className="btn-accion-tabla eliminar-btn">
                              <FaTrash /> Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    )}

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

export default GestionFichas;