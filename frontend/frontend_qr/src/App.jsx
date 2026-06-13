import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Páginas generales
import Login from './pages/Login';
import DashboardInicio from './pages/DashboardInicio';

// Admin
import GestionUsuarios from './pages/GestionUsuarios';
import Escaner from './pages/Escaner';
import Visitantes from './pages/Visitantes';
import CargaMasiva from './pages/CargaMasiva';
import CrearUsuario from './pages/CrearUsuario';
import GestionAprendices from './pages/GestionAprendices';
import Alertas from './pages/Alertas';
import RegistroAccesos from './pages/RegistroAccesos';
import GestionFichas from './pages/GestionFichas';

// Reportes generales
import Reportes from './pages/Reportes';

// NUEVA página SOLO instructor
import AsistenciaInstructor from './pages/AsistenciaInstructor';

// Seguridad
import RutaProtegida from './components/RutaProtegida';

function App() {

  return (

    <Router>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          element={
            <RutaProtegida
              rolesPermitidos={[1, 2, 3, 4]}
            />
          }
        >

          <Route
            path="/dashboard"
            element={<DashboardInicio />}
          >

            {/* OPERARIO */}
            <Route path="escaner" element={<Escaner />} />
            <Route path="visitantes" element={<Visitantes />} />
            <Route path="alertas" element={<Alertas />} />
            <Route path="registro-accesos" element={<RegistroAccesos />} />

            {/* ADMIN */}
            <Route
              element={
                <RutaProtegida
                  rolesPermitidos={[1]}
                />
              }
            >

              <Route
                path="carga-masiva"
                element={<CargaMasiva />}
              />

              <Route
                path="crear-usuario"
                element={<CrearUsuario />}
              />

              <Route
                path="gestion-usuarios"
                element={<GestionUsuarios />}
              />

              <Route
                path="gestion-aprendices"
                element={<GestionAprendices />}
              />

              <Route
                path="gestion-fichas"
                element={<GestionFichas />}
              />

            </Route>

            {/* ADMIN Y COORDINADOR */}
            <Route
              element={
                <RutaProtegida
                  rolesPermitidos={[1, 4]}
                />
              }
            >

              <Route
                path="reportes"
                element={<Reportes />}
              />

            </Route>

            {/* SOLO INSTRUCTOR */}
            <Route
              element={
                <RutaProtegida
                  rolesPermitidos={[3]}
                />
              }
            >

              <Route
                path="asistencia"
                element={<AsistenciaInstructor />}
              />

            </Route>

          </Route>

        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" />}
        />

      </Routes>

    </Router>

  );
}

export default App;