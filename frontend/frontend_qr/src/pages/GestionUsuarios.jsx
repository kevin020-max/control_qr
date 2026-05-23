// src/pages/GestionUsuarios.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaUserShield, FaUserCog, FaUsers, FaSearch, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import '../styles/GestionUsuarios.css'; 

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // --- NUEVO: Estado para el filtro por Rol ---
  const [filtroRol, setFiltroRol] = useState('');

  // Estados para el modal de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({
    visible: false,
    id_usuario: null,
    estadoActual: null,
    nombreUsuario: ''
  });

  // Modificado para enviar el id_rol dinámicamente como Query Parameter al Backend
  const obtenerUsuarios = async () => {
    try {
      setCargando(true);
      // Si filtroRol tiene valor, lo concatena a la URL ?id_rol=X
      const url = filtroRol ? `/usuarios?id_rol=${filtroRol}` : '/usuarios';
      const respuesta = await api.get(url);
      setUsuarios(respuesta.data.data || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      mostrarMensaje('Error al cargar la lista de usuarios', 'error');
    } finally {
      setCargando(false);
    }
  };

  // NUEVO: Efecto disparador para recargar los datos de MySQL en caliente cada vez que cambie el filtro del Dropdown
  useEffect(() => {
    obtenerUsuarios();
  }, [filtroRol]);

  const cambiarRol = async (id_usuario, nuevoRol) => {
    try {
      await api.put(`/usuarios/${id_usuario}/rol`, { id_rol: Number(nuevoRol) });
      mostrarMensaje('Rol actualizado correctamente', 'exito');
      obtenerUsuarios(); 
    } catch (error) {
      mostrarMensaje('Error al actualizar el rol', 'error');
    }
  };

  const solicitarCambioEstado = (user) => {
    setModalConfirmacion({
      visible: true,
      id_usuario: user.id_usuario,
      estadoActual: user.estado,
      nombreUsuario: `${user.nombres} ${user.apellidos}`
    });
  };

  const procesarCambiarEstado = async () => {
    const { id_usuario, estadoActual } = modalConfirmacion;
    const nuevoEstado = estadoActual === 1 ? 2 : 1;
    
    setModalConfirmacion({ visible: false, id_usuario: null, estadoActual: null, nombreUsuario: '' });

    try {
      await api.put(`/usuarios/${id_usuario}/estado`, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 1 ? 'Usuario Activado con éxito' : 'Usuario Desactivado con éxito', 'exito');
      obtenerUsuarios();
    } catch (error) {
      mostrarMensaje('Error al cambiar el estado del usuario', 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  // Mantenemos el filtro por texto local en el frontend para una experiencia de usuario instantánea al digitar
  const usuariosFiltrados = usuarios.filter(user => {
    const termino = busqueda.toLowerCase().trim();
    const nombreCompleto = `${user.nombres} ${user.apellidos}`.toLowerCase();
    const documento = user.numero_documento.toString();
    return !termino || nombreCompleto.includes(termino) || documento.includes(termino);
  });

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

      {/* --- TARJETAS RESUMEN DE ARRIBA --- */}
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

      {/* ============================================================================
          BLOQUE DE CONTROLES ACTUALIZADO (BÚSQUEDA + FILTRADO EN LÍNEA)
          ============================================================================ */}
      <div className="caja-herramientas-filtros-usuarios">
        
        {/* Caja de Texto de Búsqueda */}
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

        {/* NUEVO: Dropdown institucional para el Filtrado por Rol */}
        <div className="contenedor-filtro-usuarios-rol">
          <FaFilter className="icono-filtro-usuarios-input" />
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="select-filtro-rol-usuarios"
          >
            <option value="">Mostrar todos los roles</option>
            <option value="1">Administrador</option>
            <option value="2">Operario / Guarda</option>
            <option value="3">Instructor</option>
            <option value="4">Coordinador</option>
          </select>
        </div>

      </div>

      {/* --- TABLA DE DATOS DE USUARIOS --- */}
      <div className="contenedor-tabla-roles">
        {cargando ? (
          <div className="cargando-tabla">Sincronizando registros con MySQL...</div>
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
                  <td colSpan="5" className="txt-centro fila-vacia">No se encontraron usuarios coincidentes con los filtros aplicados.</td>
                </tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id_usuario} className={user.estado === 2 ? 'fila-desactivada' : ''}>
                    <td className="txt-bold">{user.numero_documento}</td>
                    <td>{user.nombres} {user.apellidos}</td>
                    
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
                        onClick={() => solicitarCambioEstado(user)} 
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

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {modalConfirmacion.visible && (
        <div className="overlay-modal-sena">
          <div className="tarjeta-modal-sena">
            <div className={`encabezado-modal-alerta ${modalConfirmacion.estadoActual === 1 ? 'alerta-roja' : 'alerta-verde'}`}>
              <FaExclamationTriangle className="icono-modal-sena-aviso" />
              <h3>Confirmar Modificación de Acceso</h3>
            </div>
            
            <div className="cuerpo-modal-sena">
              <p>¿Está seguro de que desea cambiar el estado de acceso para el siguiente usuario?</p>
              <div className="info-usuario-modal-caja">
                <strong>{modalConfirmacion.nombreUsuario}</strong>
                <span>Acción: {modalConfirmacion.estadoActual === 1 ? 'Suspender/Bloquear Cuenta' : 'Habilitar/Restaurar Cuenta'}</span>
              </div>
              <p className="txt-advertencia-sub">
                {modalConfirmacion.estadoActual === 1 
                  ? 'Esta acción impedirá inmediatamente que el usuario pueda hacer login o escanear códigos en los puntos de control del SENA.'
                  : 'Esta acción restablecerá los permisos operativos de ingreso a las instalaciones para el usuario.'}
              </p>
            </div>

            <div className="pie-modal-sena">
              <button 
                className="btn-modal-sena-cancelar" 
                onClick={() => setModalConfirmacion({ visible: false, id_usuario: null, estadoActual: null, nombreUsuario: '' })}
              >
                Cancelar
              </button>
              <button 
                className={`btn-modal-sena-confirmar ${modalConfirmacion.estadoActual === 1 ? 'confirmar-bloqueo' : 'confirmar-activacion'}`}
                onClick={procesarCambiarEstado}
              >
                Sí, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;