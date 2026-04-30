import { Navigate, Outlet } from 'react-router-dom';

const RutaProtegida = () => {
  // Verificamos si existe el token en el almacenamiento del navegador
  const token = localStorage.getItem('token');

  // Si no hay token, lo redirigimos automáticamente a la página de login
  if (!token) {
    return <Navigate to="/login" replace/>;
  }

  // Si hay token, '<Outlet />' le dice a React: "Adelante, muestra la pantalla protegida"
  return <Outlet />;
};

export default RutaProtegida;