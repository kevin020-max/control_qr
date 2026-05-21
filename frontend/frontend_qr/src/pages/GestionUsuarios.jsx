// src/pages/GestionUsuarios.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaUserShield, FaUserCog, FaUsers, FaSearch, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/GestionUsuarios.css'; // Importamos los nuevos estilos

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const obtenerUsuarios = async () => {
    try {
      const respuesta = await api.get('/usuarios');
      setUsuarios(respuesta.data.data || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      mostrarMensaje('Error al cargar la lista de usuarios', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const cambiarRol = async (id_usuario, nuevoRol) => {
    try {
      await api.put(`/usuarios/${id_usuario}/rol`, { id_rol: Number(nuevoRol) });
      mostrarMensaje('Rol actualizado correctamente', 'exito');
      obtenerUsuarios(); 
    } catch (error) {
      mostrarMensaje('Error al actualizar el rol', 'error');
    }
  };

  const cambiarEstado = async (id_usuario, estadoActual) => {
    const nuevoEstado = estadoActual === 1 ? 2 : 1;
    try {
      await api.put(`/usuarios/${id_usuario}/estado`, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 1 ? 'Usuario Activado' : 'Usuario Desactivado', 'exito');
      obtenerUsuarios();
    } catch (error) {
      mostrarMensaje('Error al cambiar el estado del usuario', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  // --- LÓGICA DE FILTRADO (Barra de búsqueda de tu Figma) ---
  const usuariosFiltrados = usuarios.filter(user => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto = `${user.nombres} ${user.apellidos}`.toLowerCase();
    const documento = user.numero_documento.toString();
    return nombreCompleto.includes(termino) || documento.includes(termino);
  });

  // --- CÁLCULO DINÁMICO DE TARJETA DE ROLES ---
  const conteoRoles = {
    admin: usuarios.filter(u => u.id_rol === 1 && u.estado === 1).length,
    operario: usuarios.filter(u => u.id_rol === 2 && u.estado === 1).length,
    otros: usuarios.filter(u => (u.id_rol === 3 || u.id_rol === 4) && u.estado === 1).length
  };

  return (
    <div className="modulo-gestion-roles">
      <div className="encabezado-roles">
        <h2>Gestión de roles</h2>
        <p>Administre los roles y permisos de los usuarios del sistema</p>
      </div>

      {mensaje.texto && (
        <div className={`alerta-flotante ${mensaje.tipo}`}>
          {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* --- TARJETAS RESUMEN DE ARRIBA (FIGMA) --- */}
      <div className="grid-tarjetas-roles">
        <div className="tarjeta-rol-info">
          <div className="icono-rol-wrapper verde-sena">
            <FaUserShield />
          </div>
          <div>
            <h3>Administrador</h3>
            <p>Acceso total ({conteoRoles.admin} activos)</p>
          </div>
        </div>

        <div className="tarjeta-rol-info">
          <div className="icono-rol-wrapper verde-claro">
            <FaUserCog />
          </div>
          <div>
            <h3>Operario</h3>
            <p>Control de acceso ({conteoRoles.operario} activos)</p>
          </div>
        </div>

        <div className="tarjeta-rol-info">
          <div className="icono-rol-wrapper gris-sena">
            <FaUsers />
          </div>
          <div>
            <h3>Instructor y Funcionario</h3>
            <p>Consultas y reportes ({conteoRoles.otros} activos)</p>
          </div>
        </div>
      </div>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="contenedor-busqueda-roles">
        <FaSearch className="icono-buscar-input" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o documento..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-buscar-roles"
        />
      </div>

      {/* --- TABLA DE DATOS DE USUARIOS --- */}
      <div className="contenedor-tabla-roles">
        {cargando ? (
          <div className="cargando-tabla">Cargando usuarios del sistema...</div>
        ) : (
          <table className="tabla-sena-roles">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Rol actual</th>
                <th>Estado</th>
                <th className="txt-centro">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="txt-centro fila-vacia">No se encontraron usuarios coincidentes.</td>
                </tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id_usuario} className={user.estado === 2 ? 'fila-desactivada' : ''}>
                    <td className="txt-bold">{user.numero_documento}</td>
                    <td>{user.nombres} {user.apellidos}</td>
                    
                    {/* El Dropdown dinámico toma el id_rol de la BD */}
                    <td>
                      <select 
                        value={user.id_rol} 
                        onChange={(e) => cambiarRol(user.id_usuario, e.target.value)}
                        className="select-tabla-rol"
                      >
                        <option value={1}>Administrador</option>
                        <option value={2}>Operario / Guarda</option>
                        <option value={3}>Instructor</option>
                        <option value={4}>Coordinador</option>
                      </select>
                    </td>

                    <td>
                      <span className={`status-badge ${user.estado === 1 ? 'activo' : 'inactivo'}`}>
                        {user.estado === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="txt-centro">
                      <button 
                        onClick={() => cambiarEstado(user.id_usuario, user.estado)}
                        className={`btn-tabla-accion ${user.estado === 1 ? 'bloquear' : 'restaurar'}`}
                      >
                        {user.estado === 1 ? 'Bloquear Acceso' : 'Restaurar Acceso'}
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

export default GestionUsuarios;