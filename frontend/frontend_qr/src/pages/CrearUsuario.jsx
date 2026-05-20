// src/pages/CrearUsuario.jsx
import { useState } from 'react';
import api from '../services/api';
import { FaUserShield, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/CrearUsuario.css'; // Importamos la hoja de estilos externa

const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    tipo_persona: 3, // Por defecto: 3 = Funcionario
    contrasenia: '', // Ajustado a "contrasenia" para que coincida con tu BD
    id_rol: 2 // Por defecto: 2 = Operario/Guarda
  });

  const [mensajeExito, setMensajeExito] = useState('');
  const [errorBackend, setErrorBackend] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend('');
    setMensajeExito('');
    setCargando(true);

    try {
      const payload = {
        ...formData,
        numero_documento: Number(formData.numero_documento),
        tipo_persona: Number(formData.tipo_persona),
        id_rol: Number(formData.id_rol)
      };

      const respuesta = await api.post('/usuarios/crear', payload);

      setMensajeExito(respuesta.data.message || 'Usuario creado correctamente.');
      
      setFormData({
        numero_documento: '', tipo_doc: 'CC', nombres: '', apellidos: '', 
        tipo_persona: 3, contrasenia: '', id_rol: 2
      });

    } catch (error) {
      console.error("Error al crear usuario", error);
      const msjError = error.response?.data?.message || 'Error de conexión con el servidor.';
      setErrorBackend(msjError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modulo-crear-usuario">
      <div className="encabezado-crear">
        <h2><FaUserShield /> Crear Nuevo Usuario Interno</h2>
        <p>Registra a un nuevo funcionario o guarda de seguridad. Los permisos de acceso se asignarán automáticamente según el rol.</p>
      </div>

      {/* Alertas de retroalimentación */}
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
            <input type="number" name="numero_documento" required value={formData.numero_documento} onChange={handleChange} className="input-sena" placeholder="Ej: 1114309103" />
          </div>
        </div>

        {/* FILA 2: Nombres y Apellidos */}
        <div className="fila-inputs">
          <div className="grupo-input">
            <label>Nombres</label>
            <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} className="input-sena" placeholder="Ej: Carlos Andrés" />
          </div>
          <div className="grupo-input">
            <label>Apellidos</label>
            <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} className="input-sena" placeholder="Ej: Mendoza" />
          </div>
        </div>

        {/* FILA 3: Roles Institucionales (CORREGIDO RBAC) */}
        <div className="fila-inputs">
          <div className="grupo-input">
            <label>Tipo de Persona (Clasificación SENA)</label>
            <select name="tipo_persona" value={formData.tipo_persona} onChange={handleChange} className="input-sena">
              <option value={3}>Funcionario / Administrativo / Guarda</option>
              <option value={2}>Instructor</option>
              {/* Ocultamos Aprendiz(1) y Visitante(4) porque no usan este formulario para login */}
            </select>
          </div>
          
          <div className="grupo-input">
            <label>Rol en el Sistema (Nivel de Permisos)</label>
            <select name="id_rol" value={formData.id_rol} onChange={handleChange} className="input-sena">
              <option value={1}>Administrador Total</option>
              <option value={2}>Operario / Guarda</option>
              <option value={3}>Instructor (Solo Reportes)</option>
              <option value={4}>Coordinador (Reportes Avanzados)</option>
            </select>
          </div>
        </div>

        {/* FILA 4: Seguridad */}
        <div className="grupo-input ancho-completo">
          <label>Contraseña de Acceso Temporal</label>
          <input type="text" name="contrasenia" required value={formData.contrasenia} onChange={handleChange} placeholder="Ej: Sena2026*" className="input-sena" />
        </div>

        <button type="submit" disabled={cargando} className="btn-sena-guardar">
          {cargando ? 'Registrando Usuario...' : 'Guardar y Autorizar Accesos'}
        </button>

      </form>
    </div>
  );
};

export default CrearUsuario;