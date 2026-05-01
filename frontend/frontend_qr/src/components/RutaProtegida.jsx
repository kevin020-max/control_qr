import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente Guardián para proteger rutas según el rol del usuario.
 * @param {Array} rolesPermitidos - Arreglo con los IDs permitidos.
 */
// 1. CORRECCIÓN: Recibimos rolesPermitidos como Prop. 
// Le asignamos = [] por defecto para que no vuelva a causar un ReferenceError si llega vacío.
const RutaProtegida = ({ rolesPermitidos = [] }) => {
  
  const token = localStorage.getItem('token');
  const usuarioString = localStorage.getItem('usuario');
  
  if (!token || !usuarioString) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioString);

  // 2. Ahora sí podemos usar .includes() con total seguridad
  if (!rolesPermitidos.includes(usuario.id_rol)) {
    // Si no tiene permiso, lo devolvemos a una ruta base
    return <Navigate to="/dashboard" replace />; 
  }

  return <Outlet />;
};

export default RutaProtegida;