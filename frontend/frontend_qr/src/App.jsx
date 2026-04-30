// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RutaProtegida from './components/RutaProtegida';
import Escaner from './pages/Escaner';
import Visitantes from './pages/Visitantes';
// 1. Aquí ya tienes importado correctamente tu nuevo componente
import DashboardInicio from './pages/DashboardInicio';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS PROTEGIDAS (Envueltas por nuestro Guardia) */}
        <Route element={<RutaProtegida />}>
          
          {/* El Dashboard actúa como la plantilla (Layout) base */}
          <Route path="/dashboard" element={<Dashboard />}>
            
            {/* 2. EL CAMBIO CLAVE: Reemplazamos la redirección por nuestro DashboardInicio.
                La propiedad 'index' significa: "Carga esto por defecto cuando visiten al padre (/dashboard)" */}
            <Route index element={<DashboardInicio />} />
            
            {/* Rutas anidadas hijas */}
            <Route path="escaner" element={<Escaner />} />
            <Route path="visitantes" element={<Visitantes />} />
          </Route>
          
        </Route>

        {/* Cualquier otra URL extraña va al Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;