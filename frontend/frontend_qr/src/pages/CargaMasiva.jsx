// src/pages/CargaMasiva.jsx
import { useState, useEffect, useRef } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaFileExcel, FaUpload, FaCheckCircle, FaExclamationCircle, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import api from '../services/api';
import '../styles/CargaMasiva.css';

const CargaMasiva = () => {
  // 1. ESTADOS DE LA INTERFAZ
  const [tabActiva, setTabActiva] = useState('aprendices'); // 'aprendices' | 'instructores' | 'funcionarios'
  const [archivo, setArchivo] = useState(null);
  const [estadoSubida, setEstadoSubida] = useState('inactivo'); // inactivo | cargando | exito | error
  const [mensaje, setMensaje] = useState({ texto: '', detalle: null });
  
  // 2. ESTADOS DE FICHAS (Solo para aprendices)
  const [fichas, setFichas] = useState([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState('');
  const [nuevaFicha, setNuevaFicha] = useState({ numero_ficha: '', nombre: '' });

  // Referencia oculta para el input de archivo
  const inputArchivoRef = useRef(null);

  // 3. CARGAR FICHAS AL INICIO
  const cargarFichas = async () => {
    try {
      const res = await api.get('/fichas');
      setFichas(res.data.data || []);
    } catch (error) {
      console.error("Error al cargar fichas:", error);
    }
  };

  useEffect(() => {
    cargarFichas();
  }, []);

  // 4. MANEJADORES DE CREACIÓN DE FICHA
  const handleCrearFicha = async (e) => {
    e.preventDefault();
    if (!nuevaFicha.numero_ficha || !nuevaFicha.nombre) return alert('Completa los datos de la ficha');
    
    try {
      const res = await api.post('/fichas', nuevaFicha);
      const nuevaAgregada = { id_ficha: res.data.data.id_ficha, numero_ficha: nuevaFicha.numero_ficha, nombre: nuevaFicha.nombre };
      setFichas([...fichas, nuevaAgregada]);
      setFichaSeleccionada(nuevaAgregada.id_ficha.toString());
      setNuevaFicha({ numero_ficha: '', nombre: '' });
      alert('Ficha creada y seleccionada con éxito');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'No se pudo crear la ficha'}`);
    }
  };

  // 5. MANEJADORES DEL ARCHIVO (DRAG & DROP)
  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files[0];
    if (file) validarYGuardarArchivo(file);
  };

  const manejarDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) validarYGuardarArchivo(file);
  };

  const validarYGuardarArchivo = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'xlsx') {
      alert("Solo se permiten archivos Excel (.xlsx)");
      return;
    }
    setArchivo(file);
    setEstadoSubida('inactivo');
    setMensaje({ texto: '', detalle: null });
  };

  // 6. ENVIAR DATOS AL BACKEND (LA MAGIA)
  const procesarCargaMasiva = async () => {
    if (!archivo) return alert("Por favor selecciona un archivo Excel.");

    setEstadoSubida('cargando');
    
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    // CORREGIDO: Si seleccionó una ficha manualmente, se envía; de lo contrario va vacío y el backend la extrae del Excel
    if (tabActiva === 'aprendices' && fichaSeleccionada) {
      formData.append('id_ficha', fichaSeleccionada);
    }

    try {
      const endpoint = `/carga-masiva/${tabActiva}`;
      const respuesta = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      setEstadoSubida('exito');
      setMensaje({ 
        texto: respuesta.data.message || '¡Carga masiva completada con éxito!', 
        detalle: respuesta.data.data 
      });
      setArchivo(null); 
      setFichaSeleccionada(''); // Reseteamos la selección manual
      cargarFichas(); // Recargamos el listado por si el backend creó una ficha nueva en caliente

    } catch (error) {
      setEstadoSubida('error');
      setMensaje({ 
        texto: error.response?.data?.message || 'Error grave al procesar el archivo', 
        detalle: null 
      });
    }
  };

  return (
    <div className="modulo-carga-masiva">
      <div className="encabezado-carga">
        <h2>Carga Masiva de Usuarios</h2>
        <p>Sube tus listas de Excel para poblar la base de datos de manera automatizada.</p>
      </div>

      {/* --- NAVEGACIÓN DE PESTAÑAS --- */}
      <div className="tabs-container">
        <button className={`tab-boton ${tabActiva === 'aprendices' ? 'activo' : ''}`} onClick={() => setTabActiva('aprendices')}>
          <FaUserGraduate /> Aprendices
        </button>
        <button className={`tab-boton ${tabActiva === 'instructores' ? 'activo' : ''}`} onClick={() => setTabActiva('instructores')}>
          <FaChalkboardTeacher /> Instructores
        </button>
        <button className={`tab-boton ${tabActiva === 'funcionarios' ? 'activo' : ''}`} onClick={() => setTabActiva('funcionarios')}>
          <FaUserTie /> Funcionarios
        </button>
      </div>

      {/* --- SECCIÓN 1: ASIGNAR FICHA (Campos manuales/opcionales) --- */}
      {tabActiva === 'aprendices' && (
        <div className="caja-seccion">
          <div className="header-automatizacion-info">
            <h3 className="titulo-seccion">1. Asignación de Ficha (Opcional)</h3>
            <div className="badge-info-automatica">
              <FaInfoCircle /> El sistema detectará y registrará de forma automática el número de ficha y programa desde el encabezado de SofiaPlus.
            </div>
          </div>
          
          <div className="grid-ficha" style={{ marginTop: '15px' }}>
            {/* Opcion A: Seleccionar Existente */}
            <div className="columna-ficha">
              <label>Forzar Ficha Existente (Opcional)</label>
              <select 
                value={fichaSeleccionada} 
                onChange={(e) => setFichaSeleccionada(e.target.value)}
                className="input-sena"
              >
                <option value="">-- Autodetectar desde el archivo (Recomendado) --</option>
                {fichas.map(f => (
                  <option key={f.id_ficha} value={f.id_ficha}>{f.numero_ficha} - {f.nombre}</option>
                ))}
              </select>
            </div>

            {/* Opcion B: Crear Nueva */}
            <div className="columna-ficha box-crear">
              <label>O Crear / Registrar Ficha Manual</label>
              <div className="fila-inputs-ficha">
                <input 
                  type="number" 
                  placeholder="Código Ficha (Ej: 2758231)" 
                  className="input-sena" 
                  value={nuevaFicha.numero_ficha}
                  onChange={(e) => setNuevaFicha({...nuevaFicha, numero_ficha: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Nombre Programa" 
                  className="input-sena" 
                  value={nuevaFicha.nombre}
                  onChange={(e) => setNuevaFicha({...nuevaFicha, nombre: e.target.value})}
                />
              </div>
              <button onClick={handleCrearFicha} className="btn-sena-outline">Crear y Seleccionar Ficha</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN 2: ZONA DRAG & DROP --- */}
      <div className="caja-seccion">
        <div className="header-seccion-archivo">
          <h3 className="titulo-seccion">{tabActiva === 'aprendices' ? '2. Cargar Archivo Excel de SofiaPlus' : '1. Cargar Archivo Excel'}</h3>
        </div>

        <div 
          className={`zona-drop ${archivo ? 'con-archivo' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={manejarDrop}
        >
          {archivo ? (
            <div className="archivo-seleccionado">
              <FaFileExcel className="icono-excel" />
              <h4>{archivo.name}</h4>
              <p>{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
              <button className="btn-remover" onClick={() => setArchivo(null)}>Quitar archivo</button>
            </div>
          ) : (
            <div className="contenido-drop">
              <div className="icono-subida-box">
                <FaFileExcel className="icono-excel-gris" />
              </div>
              <h4>Arrastra tu archivo aquí</h4>
              <p>Formatos soportados: .xlsx (Máx. 10MB)</p>
              
              <input 
                type="file" 
                accept=".xlsx" 
                ref={inputArchivoRef}
                style={{ display: 'none' }}
                onChange={manejarSeleccionArchivo}
              />
              <button className="btn-sena-verde" onClick={() => inputArchivoRef.current.click()}>
                Seleccionar Archivo
              </button>
            </div>
          )}
        </div>

        {/* --- BOTÓN DE PROCESAMIENTO Y ALERTAS --- */}
        {archivo && estadoSubida === 'inactivo' && (
          <button className="btn-sena-verde btn-procesar" onClick={procesarCargaMasiva}>
            <FaUpload /> Procesar Carga de {tabActiva.charAt(0).toUpperCase() + tabActiva.slice(1)}
          </button>
        )}

        {estadoSubida === 'cargando' && (
          <div className="alerta-info">
            <FaSpinner className="icono-girando" /> Procesando {archivo.name}... Esto puede tomar unos segundos.
          </div>
        )}

        {estadoSubida === 'exito' && (
          <div className="alerta-exito-masiva">
            <FaCheckCircle className="icono-exito" />
            <div className="textos-exito">
              <h4>{mensaje.texto}</h4>
              {mensaje.detalle && (
                <p>
                  <strong>Leídos:</strong> {mensaje.detalle.totalFilasLeidas} | 
                  <strong> Insertados:</strong> {mensaje.detalle.estadisticas.insertados} | 
                  <strong> Actualizados:</strong> {mensaje.detalle.estadisticas.actualizados} | 
                  <strong> Omitidos:</strong> {mensaje.detalle.estadisticas.omitidos}
                </p>
              )}
            </div>
          </div>
        )}

        {estadoSubida === 'error' && (
          <div className="alerta-error">
            <FaExclamationCircle /> {mensaje.texto}
          </div>
        )}

      </div>
    </div>
  );
};

export default CargaMasiva;