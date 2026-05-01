// src/pages/CrearUsuario.jsx
import { useState } from 'react';
import api from '../services/api'; // Tu instancia de Axios que envía el Token automáticamente

const CrearUsuario = () => {
  // 1. ESTADO CENTRALIZADO: En lugar de tener 7 useState diferentes, 
  // usamos un solo objeto para mantener el código limpio.
  const [formData, setFormData] = useState({
    numero_documento: '',
    tipo_doc: 'CC', // Valor por defecto
    nombres: '',
    apellidos: '',
    tipo_persona: 2, // 2 = Instructor, 3 = Funcionario
    contrasena: '',
    id_rol: 2 // 2 = Operario/Guarda, 3 = Instructor, etc.
  });

  // Estados para retroalimentación visual
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorBackend, setErrorBackend] = useState('');
  const [cargando, setCargando] = useState(false);

  // 2. FUNCIÓN MANEJADORA DE CAMBIOS: Actualiza el estado al escribir
  const handleChange = (e) => {
    // Extraemos el nombre del input y el valor digitado
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value // Actualiza dinámicamente la propiedad correcta
    });
  };

  // 3. FUNCIÓN DE ENVÍO AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend('');
    setMensajeExito('');
    setCargando(true);

    try {
      // PREPARACIÓN: Convertimos strings a números para que Zod y MySQL no se quejen
      const payload = {
        ...formData,
        numero_documento: Number(formData.numero_documento),
        tipo_persona: Number(formData.tipo_persona),
        id_rol: Number(formData.id_rol)
      };

      // PETICIÓN HTTP: Como usamos nuestra 'api' configurada, el Token viaja oculto
      const respuesta = await api.post('/usuarios/crear', payload);

      // Si todo sale bien
      setMensajeExito(respuesta.data.message);
      
      // Limpiamos el formulario para permitir un nuevo registro
      setFormData({
        numero_documento: '', tipo_doc: 'CC', nombres: '', apellidos: '', 
        tipo_persona: 2, contrasena: '', id_rol: 2
      });

    } catch (error) {
      console.error("Error al crear usuario", error);
      // Capturamos el error exacto que nos envía nuestro controlador o validadores
      const msjError = error.response?.data?.message || 'Error de conexión con el servidor.';
      setErrorBackend(msjError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Crear Nuevo Usuario Interno</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Registra a un nuevo funcionario o guarda de seguridad. El sistema creará sus credenciales automáticamente.
      </p>

      {/* Alertas de retroalimentación */}
      {errorBackend && <div style={estilos.alertaError}>{errorBackend}</div>}
      {mensajeExito && <div style={estilos.alertaExito}>{mensajeExito}</div>}

      <form onSubmit={handleSubmit} style={estilos.formulario}>
        
        {/* FILA 1: Documento */}
        <div style={estilos.fila}>
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Tipo Doc.</label>
            <select name="tipo_doc" value={formData.tipo_doc} onChange={handleChange} style={estilos.input}>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PEP">PEP</option>
            </select>
          </div>
          
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Número de Documento</label>
            <input type="number" name="numero_documento" required value={formData.numero_documento} onChange={handleChange} style={estilos.input} />
          </div>
        </div>

        {/* FILA 2: Nombres y Apellidos */}
        <div style={estilos.fila}>
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Nombres</label>
            <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} style={estilos.input} />
          </div>
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Apellidos</label>
            <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} style={estilos.input} />
          </div>
        </div>

        {/* FILA 3: Roles Institucionales */}
        <div style={estilos.fila}>
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Tipo de Persona en SENA</label>
            <select name="tipo_persona" value={formData.tipo_persona} onChange={handleChange} style={estilos.input}>
              <option value={2}>Instructor</option>
              <option value={3}>Funcionario Administrativo</option>
              <option value={4}>Servicios Generales</option>
              <option value={5}>Guarda de Seguridad</option>
            </select>
          </div>
          
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Rol en el Sistema (Permisos)</label>
            <select name="id_rol" value={formData.id_rol} onChange={handleChange} style={estilos.input}>
              <option value={1}>Administrador Total</option>
              <option value={2}>Operario / Guarda</option>
              <option value={3}>Instructor (Solo Reportes)</option>
              <option value={4}>Coordinador (Reportes Avanzados)</option>
            </select>
          </div>
        </div>

        {/* FILA 4: Seguridad */}
        <div style={estilos.grupoInput}>
          <label style={estilos.label}>Contraseña de Acceso Temporal</label>
          <input type="text" name="contrasena" required value={formData.contrasena} onChange={handleChange} placeholder="Ej: Sena2026*" style={estilos.input} />
        </div>

        <button type="submit" disabled={cargando} style={estilos.boton}>
          {cargando ? 'Creando Usuario...' : 'Guardar y Autorizar Accesos'}
        </button>

      </form>
    </div>
  );
};

// Estilos básicos y profesionales
const estilos = {
  contenedor: { padding: '20px', maxWidth: '800px' },
  titulo: { color: '#39A900', borderBottom: '2px solid #ccc', paddingBottom: '10px' },
  formulario: { display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  fila: { display: 'flex', gap: '15px' },
  grupoInput: { display: 'flex', flexDirection: 'column', flex: 1 },
  label: { marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#333' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '15px' },
  boton: { padding: '12px', backgroundColor: '#39A900', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  alertaExito: { backgroundColor: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' },
  alertaError: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }
};

export default CrearUsuario;