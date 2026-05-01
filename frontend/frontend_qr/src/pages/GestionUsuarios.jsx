// src/pages/GestionUsuarios.jsx
import { useState, useEffect } from 'react';
import api from '../services/api'; // Tu herramienta configurada para enviar el Token

const GestionUsuarios = () => {
  // 1. ESTADOS: Para guardar la lista, controlar el texto de "Cargando..." y posibles errores
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // Para alertas visuales

  // 2. READ: Función para traer todos los usuarios del backend
  const obtenerUsuarios = async () => {
    try {
      const respuesta = await api.get('/usuarios');
      // Guardamos la lista de usuarios en el estado de React
      setUsuarios(respuesta.data.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      mostrarMensaje('Error al cargar la lista de usuarios', 'error');
    } finally {
      setCargando(false);
    }
  };

  // 3. EFFECT: Se ejecuta automáticamente SOLO UNA VEZ cuando la página carga
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // 4. UPDATE: Función para cambiar el rol de un usuario
  const cambiarRol = async (id_usuario, nuevoRol) => {
    try {
      await api.put(`/usuarios/${id_usuario}/rol`, { id_rol: Number(nuevoRol) });
      mostrarMensaje('Rol actualizado correctamente', 'exito');
      obtenerUsuarios(); // Recargamos la tabla para ver los cambios
    } catch (error) {
      mostrarMensaje('Error al actualizar el rol', 'error');
    }
  };

  // 5. DELETE (Soft Delete): Función para Activar/Desactivar
  const cambiarEstado = async (id_usuario, estadoActual) => {
    // Si el estado actual es 1 (Activo), el nuevo será 2 (Desactivado), y viceversa
    const nuevoEstado = estadoActual === 1 ? 2 : 1;
    try {
      await api.put(`/usuarios/${id_usuario}/estado`, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 1 ? 'Usuario Activado' : 'Usuario Desactivado', 'exito');
      obtenerUsuarios(); // Recargamos la tabla
    } catch (error) {
      mostrarMensaje('Error al cambiar el estado del usuario', 'error');
    }
  };

  // Función auxiliar para mostrar alertas por 3 segundos
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Gestión de Usuarios del Sistema</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Administra los roles y el acceso al sistema de los funcionarios e instructores.
      </p>

      {/* Alerta flotante de retroalimentación */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'exito' ? estilos.alertaExito : estilos.alertaError}>
          {mensaje.texto}
        </div>
      )}

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>Documento</th>
              <th style={estilos.th}>Nombre Completo</th>
              <th style={estilos.th}>Rol Actual</th>
              <th style={estilos.th}>Estado / Acceso</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id_usuario} style={{ backgroundColor: user.estado === 2 ? '#fee2e2' : 'white' }}>
                <td style={estilos.td}>{user.numero_documento}</td>
                <td style={estilos.td}>{user.nombres} {user.apellidos}</td>
                
                {/* Selector de Rol interactivo */}
                <td style={estilos.td}>
                  <select 
                    value={user.id_rol} 
                    onChange={(e) => cambiarRol(user.id_usuario, e.target.value)}
                    style={estilos.select}
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Operario / Guarda</option>
                    <option value={3}>Instructor</option>
                    <option value={4}>Coordinador</option>
                  </select>
                </td>

                <td style={estilos.td}>
                  <span style={user.estado === 1 ? estilos.badgeActivo : estilos.badgeInactivo}>
                    {user.estado === 1 ? 'Activo' : 'Desactivado'}
                  </span>
                </td>

                {/* Botón de Soft Delete */}
                <td style={estilos.td}>
                  <button 
                    onClick={() => cambiarEstado(user.id_usuario, user.estado)}
                    style={user.estado === 1 ? estilos.botonPeligro : estilos.botonExito}
                  >
                    {user.estado === 1 ? 'Bloquear Acceso' : 'Restaurar Acceso'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Estilos para una tabla profesional
const estilos = {
  contenedor: { padding: '20px', maxWidth: '1000px' },
  titulo: { color: '#39A900', borderBottom: '2px solid #ccc', paddingBottom: '10px' },
  tabla: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  th: { backgroundColor: '#f3f4f6', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' },
  td: { padding: '12px', borderBottom: '1px solid #ddd' },
  select: { padding: '5px', borderRadius: '4px', border: '1px solid #ccc' },
  badgeActivo: { backgroundColor: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  badgeInactivo: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  botonPeligro: { padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  botonExito: { padding: '8px 12px', backgroundColor: '#39A900', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  alertaExito: { backgroundColor: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
  alertaError: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '5px', marginBottom: '15px' }
};

export default GestionUsuarios;