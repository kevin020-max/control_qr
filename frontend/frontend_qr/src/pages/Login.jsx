import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaIdCard, FaLock } from 'react-icons/fa'; // Íconos para los inputs
import api from '../services/api';

const Login = () => {
  // 1. ESTADOS: Guardan la información que el usuario teclea en tiempo real
  const [documento, setDocumento] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorBackend, setErrorBackend] = useState(''); // Para mostrar errores como "Contraseña incorrecta"

  // Herramienta de React Router para cambiar de página
  const navigate = useNavigate();

  // 2. FUNCIÓN DE ENVÍO: Se ejecuta al hacer clic en "Ingresar"
  const manejarSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue (comportamiento por defecto de HTML)
    setErrorBackend(''); // Limpiamos cualquier error previo para ocultar el cuadro rojo

    // CORRECCIÓN 1: Creamos el objeto con los datos exactamente como los pide tu Backend
    const datosLogin = {
      numero_documento: Number(documento), // 'documento' viene de tu estado (useState)
      contrasena: contrasena       // 'contrasena' viene de tu estado (useState)
    };

    try {
      // CORRECCIÓN 2: Usamos tu herramienta 'api' en lugar de 'axios'.
      // Como 'api' ya tiene la URL base configurada, solo ponemos el final de la ruta.
      const respuesta = await api.post('/auth/login', datosLogin);
      
      // 1. Guardamos el token y los datos del usuario en el "bolsillo" del navegador
      const { token, data } = respuesta.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // 2. Leemos el id_rol para saber a dónde mandarlo
      const id_rol = data.usuario.id_rol;

      // 3. Redirección inteligente usando el hook useNavigate()
      // Si es Administrador (1) O si es Operario (2), ambos van a la misma plantilla
      if (id_rol === 1 || id_rol === 2) {
        navigate('/dashboard'); 
      } else {
        navigate('/reportes'); // Instructores (3) y Coordinadores (4) van a reportes
      }

    } catch (error) {
      console.error("Error al iniciar sesión", error);
      
      // CORRECCIÓN 4: Atrapamos el mensaje de error EXACTO que envía nuestro Backend 
      // (ej. "Usuario o contraseña incorrectos") y lo mostramos en pantalla
      const mensajeError = error.response?.data?.message || 'Error al conectar con el servidor';
      setErrorBackend(mensajeError);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        <h2 style={estilos.titulo}>Control de Acceso</h2>
        
        {/* Si hay un error, mostramos este cuadro rojo */}
        {errorBackend && <div style={estilos.cajaError}>{errorBackend}</div>}

        <form onSubmit={manejarSubmit}>
          {/* Input de Documento */}
          <div style={estilos.grupoInput}>
            <FaIdCard style={estilos.icono} />
            <input 
              type="number" 
              placeholder="Número de Documento" 
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              style={estilos.input}
              required
            />
          </div>

          {/* Input de Contraseña */}
          <div style={estilos.grupoInput}>
            <FaLock style={estilos.icono} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              style={estilos.input}
              required
            />
          </div>

          <button type="submit" style={estilos.boton}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

// 6. ESTILOS BÁSICOS
const estilos = {
  contenedor: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  tarjeta: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  titulo: { textAlign: 'center', color: '#39A900', marginBottom: '20px' }, // Verde SENA
  grupoInput: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px', padding: '10px' },
  icono: { color: '#888', marginRight: '10px' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '16px' },
  boton: { width: '100%', padding: '12px', backgroundColor: '#39A900', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  cajaError: { backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }
};

export default Login;