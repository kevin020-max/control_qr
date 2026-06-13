import { useEffect, useState } from 'react';
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaDownload,
  FaCalendarAlt
} from 'react-icons/fa';

import api from '../services/api';
import '../styles/AsistenciaInstructor.css';

const AsistenciaInstructor = () => {
  const [ficha, setFicha] = useState('');
  const [fecha, setFecha] = useState('');
  const [busquedaFicha, setBusquedaFicha] = useState('');

  const [fichas, setFichas] = useState([]);
  const [aprendices, setAprendices] = useState([]);

  const [totalAprendices, setTotalAprendices] = useState(0);
  const [presentes, setPresentes] = useState(0);
  const [ausentes, setAusentes] = useState(0);

  useEffect(() => {
    cargarFichas();
  }, []);

  const cargarFichas = async () => {
    try {
      const respuesta = await api.get('/fichas');
      setFichas(respuesta.data.data);
    } catch (error) {
      console.error('Error cargando fichas', error);
    }
  };

  const consultarAsistencia = async () => {
    if (!ficha || !fecha) {
      alert('Seleccione una ficha y una fecha');
      return;
    }

    try {
      const respuesta = await api.get(
        `/asistencia?id_ficha=${ficha}&fecha=${fecha}`
      );

      setAprendices(respuesta.data.aprendices);
      setTotalAprendices(respuesta.data.totalAprendices);
      setPresentes(respuesta.data.presentes);
      setAusentes(respuesta.data.ausentes);
    } catch (error) {
      console.error(
        'Error consultando asistencia',
        error
      );
    }
  };

  const exportarPdf = async () => {
    if (!ficha || !fecha) {
      alert(
        'Seleccione una ficha y una fecha'
      );
      return;
    }

  try {
    const response = await api.get(
      `/asistencia/pdf?id_ficha=${ficha}&fecha=${fecha}`,
      {
        responseType: 'blob'
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link =
      document.createElement('a');

    link.href = url;

    link.setAttribute(
      'download',
      `Asistencia_${fecha}.pdf`
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {

    console.error(
      'Error exportando PDF:',
      error
    );

    alert(
      'No fue posible generar el PDF.'
    );
  }
};

  return (
    <div className="modulo-asistencia">
      <div className="encabezado-asistencia">
        <h2>Control de Asistencia</h2>

        <p>
          Consulte la asistencia de aprendices
          por ficha y fecha.
        </p>
      </div>

      <div className="caja-filtros">
        <div className="filtro-select buscador-ficha">
          <FaUsers className="icono-filtro" />

          <input
            type="text"
            placeholder="Buscar número de ficha..."
            value={busquedaFicha}
            onChange={(e) =>
              setBusquedaFicha(e.target.value)
            }
          />

          {busquedaFicha !== '' && (
            <div className="lista-fichas">
              {fichas
                .filter((item) =>
                  item.numero_ficha
                    .toString()
                    .includes(busquedaFicha)
                )
                .slice(0, 10)
                .map((item) => (
                  <div
                    key={item.id_ficha}
                    className="item-ficha"
                    onClick={() => {
                      setFicha(item.id_ficha);

                      setBusquedaFicha(
                        `${item.numero_ficha} - ${item.nombre}`
                      );
                    }}
                  >
                    {item.numero_ficha} - {item.nombre}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="filtro-select">
          <FaCalendarAlt className="icono-filtro" />

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
          />
        </div>

        <button
          className="btn-consultar"
          onClick={consultarAsistencia}
        >
          Consultar
        </button>
      </div>

      <div className="grid-metricas">
        <div className="tarjeta-metrica">
          <div>
            <p>Total Aprendices</p>
            <h3>{totalAprendices}</h3>
          </div>

          <div className="icono-caja verde">
            <FaUsers />
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div>
            <p>Asistieron</p>
            <h3>{presentes}</h3>
          </div>

          <div className="icono-caja verde">
            <FaUserCheck />
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div>
            <p>Ausentes</p>
            <h3>{ausentes}</h3>
          </div>

          <div className="icono-caja verde">
            <FaUserTimes />
          </div>
        </div>
      </div>

      <div className="tabla-container">
        <div className="tabla-header">
          <h3>Listado de Asistencia</h3>

          <button
            className="btn-exportar"
            onClick={exportarPdf}
          >
            <FaDownload />
            Exportar PDF
          </button>
        </div>

        <table className="tabla-asistencia">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Hora Ingreso</th>
              <th>Hora Salida</th>
              <th>Tiempo Total</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {aprendices.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="sin-registros"
                >
                  No hay registros disponibles
                </td>
              </tr>
            )}

            {aprendices.map((aprendiz, index) => (
              <tr key={index}>
                <td>{aprendiz.documento}</td>

                <td>{aprendiz.nombre}</td>

                <td>{aprendiz.horaIngreso}</td>

                <td>{aprendiz.horaSalida}</td>

                <td>{aprendiz.tiempoTotal}</td>

                <td>
                  <span
                    className={
                      aprendiz.estado === 'Asistió'
                        ? 'estado-presente'
                        : 'estado-ausente'
                    }
                  >
                    {aprendiz.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsistenciaInstructor;