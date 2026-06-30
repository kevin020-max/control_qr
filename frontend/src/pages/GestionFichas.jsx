// src/pages/GestionFichas.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaCheckCircle, FaExclamationCircle, FaListUl, FaSearch } from 'react-icons/fa';
import '../styles/GestionFichas.css';

const GestionFichas = () => {
  // 1. ESTADOS GENERALES
  const [fichas, setFichas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // --- NUEVO: Estado para la barra de búsqueda ---
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para crear nueva ficha de manera opcional/manual
  const [formData, setFormData] = useState({ numero_ficha: '', nombre: '' });

  // 2. OBTENER LISTADO (READ)
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

  // 3. CREAR FICHA MANUAL (CREATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await api.post('/fichas', formData);
      mostrarMensaje(respuesta.data.message || 'Ficha registrada con éxito.', 'exito');
      setFormData({ numero_ficha: '', nombre: '' });
      obtenerFichas();
    } catch (error) {
      mostrarMensaje(error.response?.data?.message || 'Error al guardar la ficha.', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  // --- NUEVO: LÓGICA DE FILTRADO DINÁMICO POR TEXTO O CÓDIGO ---
  const fichasFiltradas = fichas.filter((ficha) => {
    const termino = busqueda.toLowerCase().trim();
    const codigoFicha = ficha.numero_ficha.toString();
    const nombrePrograma = ficha.nombre.toLowerCase();
    
    // Si no hay término ingresado muestra todo, de lo contrario evalúa coincidencias
    return !termino || codigoFicha.includes(termino) || nombrePrograma.includes(termino);
  });

  return (
    <div className="modulo-gestion-fichas">
      <div className="encabezado-fichas">
        <h2>Gestión de Fichas</h2>
        <p>Consulte las fichas registradas de forma automática o cree nuevos programas de manera manual.</p>
      </div>

      {mensaje.texto && (
        <div className={`alerta-fichas ${mensaje.tipo}`}>
          {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* PANEL DE REGISTRO MANUAL */}
      <div className="tarjeta-ficha-panel">
        <h3>Registrar Nueva Ficha de Formación (Manual)</h3>
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

      {/* PANEL DIRECTORIO / TABLA DE SOLO LECTURA */}
      <div className="tarjeta-ficha-panel">
        <div className="caja-tabla-header-con-buscador">
          <h3 className="titulo-lista-fichas" style={{ margin: 0 }}><FaListUl /> Fichas Registradas en el Sistema</h3>
          
          {/* --- NUEVA BARRA DE BÚSQUEDA --- */}
          <div className="contenedor-busqueda-fichas-dinamico">
            <FaSearch className="icono-buscar-ficha" />
            <input 
              type="text"
              placeholder="Buscar por código de ficha o programa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-buscar-fichas-sena"
            />
          </div>
        </div>
        
        {cargando ? (
          <div className="cargando-fichas-txt">Consultando las fichas académicas con MySQL...</div>
        ) : (
          <table className="tabla-fichas-sena">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>ID</th>
                <th style={{ width: '220px' }}>Número de Ficha</th>
                <th>Programa de Formación Vinculado</th>
              </tr>
            </thead>
            <tbody>
              {fichasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="txt-centro-sena fila-vacia">No se encontraron fichas de formación coincidentes.</td>
                </tr>
              ) : (
                fichasFiltradas.map((ficha) => (
                  <tr key={ficha.id_ficha}>
                    <td className="txt-id-gris">#{ficha.id_ficha}</td>
                    <td className="txt-numero-ficha-bold">{ficha.numero_ficha}</td>
                    <td className="txt-nombre-programa-sena">{ficha.nombre}</td>
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