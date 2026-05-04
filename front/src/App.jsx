import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Aprendices from "./pages/Aprendices";
import Instructores from "./pages/Instructores";
import Funcionarios from "./pages/Funcionarios";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/aprendices" />} />
          <Route path="/aprendices" element={<Aprendices />} />
          <Route path="/instructores" element={<Instructores />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;