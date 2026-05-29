// src/pages/CrearUsuario.jsx
import { useState } from 'react';
import api from '../services/api';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/CrearUsuario.css';

const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    contrasenia: '',
    id_rol: 2 // Por defecto: Operario / Guarda
  });

  const [mensajeExito, setMensajeExito] = useState('');
  const [errorBackend, setErrorBackend] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend('');
    setMensajeExito('');
    setCargando(true);

    try {
      // MAPEO AUTOMÁTICO DE INGENIERÍA:
      // Dependiendo del Rol seleccionado, deducimos el tipo_persona de la institución (Tabla personas)
      let tipo_persona_deducido = 3; // Por defecto: Funcionario (Para Admin y Operario/Guarda)
      
      if (Number(formData.id_rol) === 3) {
        tipo_persona_deducido = 2; // Si es el rol Instructor, en la tabla personas debe ser 2 (Instructor)
      }

      const payload = {
        ...formData,
        numero_documento: Number(formData.numero_documento),
        id_rol: Number(formData.id_rol),
        tipo_persona: tipo_persona_deducido // Se envía automáticamente calculado
      };

      const respuesta = await api.post('/usuarios/crear', payload);

      setMensajeExito(respuesta.data.message || 'Usuario creado correctamente.');
      setFormData({
        numero_documento: '', tipo_doc: 'CC', nombres: '', apellidos: '', 
        contrasenia: '', id_rol: 2
      });

    } catch (error) {
      console.error("Error al crear usuario", error);
      setErrorBackend(error.response?.data?.message || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modulo-crear-usuario">
      <div className="encabezado-crear">
        <h2>Crear Nuevo Usuario Interno</h2>
        <p>Registra las credenciales de acceso. El sistema asignará los permisos institucionales correspondientes según el rol seleccionado.</p>
      </div>

      {errorBackend && (
        <div className="alerta-crear error">
          <FaExclamationCircle /> <span>{errorBackend}</span>
        </div>
      )}
      
      {mensajeExito && (
        <div className="alerta-crear exito">
          <FaCheckCircle /> <span>{mensajeExito}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-crear-usuario">
        
        {/* FILA 1: Documento */}
        <div className="fila-inputs">
          <div className="grupo-input">
            <label>Tipo Doc.</label>
            <select name="tipo_doc" value={formData.tipo_doc} onChange={handleChange} className="input-sena">
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PEP">PEP</option>
            </select>
          </div>
          
          <div className="grupo-input">
            <label>Número de Documento</label>
            <input type="number" name="numero_documento" required value={formData.numero_documento} onChange={handleChange} className="input-sena" placeholder="Ej: 1115309103" />
          </div>
        </div>

        {/* FILA 2: Nombres y Apellidos */}
        <div className="fila-inputs">
          <div className="grupo-input">
            <label>Nombres</label>
            <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} className="input-sena" placeholder="Ej: Sofia" />
          </div>
          <div className="grupo-input">
            <label>Apellidos</label>
            <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} className="input-sena" placeholder="Ej: Perez" />
          </div>
        </div>

        {/* FILA 3: UN SOLO DROPDOWN DE ROL (REQUERIMIENTO FIGMA) */}
        <div className="fila-inputs">
          <div className="grupo-input ancho-completo">
            <label>Rol en el Sistema</label>
            <select name="id_rol" value={formData.id_rol} onChange={handleChange} className="input-sena">
              <option value={2}>Operario / Guarda de Seguridad</option>
              <option value={1}>Administrador Total</option>
              <option value={3}>Instructor (Módulo de Reportes)</option>
              <option value={4}>Coordinador (Reportes Avanzados)</option>
            </select>
          </div>
        </div>

        {/* FILA 4: Seguridad */}
        <div className="grupo-input ancho-completo">
          <label>Contraseña de Acceso Temporal</label>
          <input type="text" name="contrasenia" required value={formData.contrasenia} onChange={handleChange} placeholder="Ej: guarda123" className="input-sena" />
        </div>

        <button type="submit" disabled={cargando} className="btn-sena-guardar">
          {cargando ? 'Registrando Usuario...' : 'Guardar y Autorizar Accesos'}
        </button>

      </form>
    </div>
  );
};

export default CrearUsuario;