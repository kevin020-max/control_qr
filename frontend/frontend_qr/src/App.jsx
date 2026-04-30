// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RutaProtegida from './components/RutaProtegida';

// Pantallas temporales para rellenar el Dashboard por ahora
const EscanerTemp = () => <h2>Pantalla del Escáner (Próximamente)</h2>;
const VisitantesTemp = () => <h2>Formulario de Visitantes (Próximamente)</h2>;

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
            {/* Si entran directo a /dashboard, los mandamos por defecto al escáner */}
            <Route index element={<Navigate to="escaner" replace />} />
            
            {/* Rutas anidadas hijas */}
            <Route path="escaner" element={<EscanerTemp />} />
            <Route path="visitantes" element={<VisitantesTemp />} />
          </Route>
          
        </Route>

        {/* Cualquier otra URL extraña va al Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;