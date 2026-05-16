// src/pages/RegistroAccesos.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/RegistroAccesos.css';

const RegistroAccesos = () => {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');

  useEffect(() => {
    const traerAccesosDelDia = async () => {
      try {
        const respuesta = await api.get('/accesos/hoy');
        setRegistros(respuesta.data.data);
      } catch (error) {
        console.error("Error al obtener accesos:", error);
      }
    };
    traerAccesosDelDia();
  }, []);

  // Lógica de filtrado en tiempo real sin recargar página
  const registrosFiltrados = registros.filter((item) => {
    const coincideTexto = 
      item.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.numero_documento?.toString().includes(busqueda);

    const coincideRol = 
      filtroRol === 'TODOS' || item.nombre_tipo?.toUpperCase() === filtroRol;

    return coincideTexto && coincideRol;
  });

  const formatearHora = (fechaString) => {
    if (!fechaString) return '---';
    return new Date(fechaString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modulo-accesos">
      <div className="titulos-contenido">
        <h1>Control de Accesos Diarios</h1>
        <p>Monitoreo en tiempo real de entradas y salidas del centro de formación</p>
      </div>

      {/* BARRA DE FILTROS (Igual a la de tu Figma) */}
      <div className="barra-filtros">
        <input 
          type="text" 
          placeholder="Buscar por nombre, apellido o documento..." 
          className="input-busqueda"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
        <select 
          className="select-filtro"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="TODOS">Todos los roles</option>
          <option value="APRENDIZ">Aprendices</option>
          <option value="INSTRUCTOR">Instructores</option>
          <option value="FUNCIONARIO">Funcionarios</option>
          <option value="VISITANTE">Visitantes</option>
        </select>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="tabla-contenedor">
        <table className="tabla-accesos">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre Completo</th>
              <th>Rol / Tipo</th>
              <th>Ficha</th>
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.length > 0 ? (
              registrosFiltrados.map((acceso, idx) => (
                <tr key={acceso.id_control || idx}>
                  <td>{acceso.numero_documento}</td>
                  <td>{acceso.nombres} {acceso.apellidos}</td>
                  <td>
                    <span className={`badge-rol ${acceso.nombre_tipo?.toLowerCase()}`}>
                      {acceso.nombre_tipo}
                    </span>
                  </td>
                  <td>{acceso.numero_ficha || 'N/A'}</td>
                  <td style={{ color: '#22c55e', fontWeight: '500' }}>
                    {formatearHora(acceso.fecha_entrada)}
                  </td>
                  <td style={{ color: acceso.fecha_salida ? '#ef4444' : '#6b7280', fontWeight: '500' }}>
                    {formatearHora(acceso.fecha_salida)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                  No se encontraron registros que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistroAccesos;