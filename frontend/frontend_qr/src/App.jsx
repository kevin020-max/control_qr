// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Páginas de acceso y generales
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardInicio from './pages/DashboardInicio';
import GestionUsuarios from './pages/GestionUsuarios';

// Páginas operativas
import Escaner from './pages/Escaner';
import Visitantes from './pages/Visitantes';
import CargaMasiva from './pages/CargaMasiva';
import CrearUsuario from './pages/CrearUsuario';

// NUEVAS páginas para los otros roles
import Reportes from './pages/Reportes';

// Nuestro guardián de seguridad
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= RUTA PÚBLICA ================= */}
        <Route path="/login" element={<Login />} />

        {/* ================= RUTAS PROTEGIDAS ================= */}
        
        {/* 1. GRUPO OPERARIO (Rol 2) Y ADMIN (Rol 1) */}
        {/* El Administrador también tiene permiso de ver esto por si necesita operar el escáner */}
        <Route element={<RutaProtegida rolesPermitidos={[1, 2]} />}>
          
          {/* El Dashboard actúa como la plantilla (Layout) base para este grupo */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardInicio />} />
            <Route path="escaner" element={<Escaner />} />
            <Route path="visitantes" element={<Visitantes />} />

            {/* ¡NUEVO! Sub-rutas EXCLUSIVAS del Administrador dentro del Dashboard */}
            <Route element={<RutaProtegida rolesPermitidos={[1]} />}>
              <Route path="carga-masiva" element={<CargaMasiva />} />
              <Route path="crear-usuario" element={<CrearUsuario />} />
              <Route path="gestion-usuarios" element={<GestionUsuarios />} />
            </Route>
          </Route>
          
        </Route>

        {/* 3. GRUPO DE INSTRUCTORES (3), COORDINADORES (4) Y ADMIN (1) */}
        <Route element={<RutaProtegida rolesPermitidos={[1, 3, 4]} />}>
          <Route path="/reportes" element={<Reportes />} />
        </Route>

        {/* ================= RUTA POR DEFECTO ================= */}
        {/* Cualquier otra URL extraña va al Login para que el sistema decida qué hacer */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;