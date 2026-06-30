import { useState } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/Visitantes.css';

const Visitantes = () => {
  const [formulario, setFormulario] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    observacion: '',
    horas_validez: 2
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [qrGenerado, setQrGenerado] = useState(null);

  const manejarCambio = (e) => {

    const { name, value } = e.target;

    if (name === 'horas_validez') {
      let horas = Number(value);
      if (isNaN(horas)) horas = 1;
      if (horas < 1) horas = 1;
      if (horas > 12) horas = 12;
      setFormulario({
        ...formulario,
        horas_validez: horas
      });

      return;
    }

    setFormulario({
      ...formulario,
      [name]: value
    });

  };

  const registrarVisitante = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Registrando...', tipo: 'info' });
    setQrGenerado(null);

    try {
      const datosAEnviar = {
        ...formulario,
        numero_documento: Number(formulario.numero_documento),
        horas_validez: Number(formulario.horas_validez)
      };

      const respuesta = await api.post('/visitantes/registrar', datosAEnviar);

      setMensaje({ texto: respuesta.data.message || 'Visitante registrado con éxito', tipo: 'exito' });
      setQrGenerado(datosAEnviar.numero_documento);
      
      setFormulario({ 
        numero_documento: '', 
        tipo_doc: 'CC', 
        nombres: '', 
        apellidos: '', 
        observacion: '', 
        horas_validez: 2 
      });

    } catch (error) {
      setMensaje({
        texto: error.response?.data?.message || 'Error al conectar con el servidor',
        tipo: 'error'
      });
    }
  };

  return (
    <div className='modulo-visitantes'>
      <h2 className='titulo'>Registrar Nuevo Visitante</h2>
      <p className='subtitulo'>
        Completa los datos para generar el QR de acceso temporal.
      </p>

      {/* Alertas del sistema */}
      {mensaje.texto && (
        <div className={`alerta-formulario ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* PANEL PRINCIPAL BLANCO */}
      <div className='tarjeta-formulario-visitantes'>
        {qrGenerado ? (
          <div className='caja-qr-exito'>
            <h3>¡QR Generado con Éxito!</h3>
            <p>Tómale una foto a este código o imprímelo para el visitante.</p>
            <div className='contenedor-qr-svg'>
              <QRCodeSVG value={String(qrGenerado)} size={200} />
            </div>
            <button className='btn-sena-visitantes' onClick={() => setQrGenerado(null)}>
              Registrar Otro Visitante
            </button>
          </div>
        ) : (
          /* FORMULARIO DIVIDIDO EN 2 COLUMNAS SEGÚN TU FIGMA */
          <form onSubmit={registrarVisitante} className='formulario-grid-sena'>
            
            {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
            <div className='columna-formulario'>
              <div className='grupo-input-sena'>
                <label>Tipo Doc.</label>
                <select name="tipo_doc" value={formulario.tipo_doc} onChange={manejarCambio} className='input-sena'>
                  <option value="CC">Cédula</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula Extranjería</option>
                  <option value="PEP">PEP</option>
                </select>
              </div>

              <div className='grupo-input-sena'>
                <label>Número de Documento</label>
                <input type="number" name="numero_documento" required max="2147483647" value={formulario.numero_documento}
                  onChange={(e) => {
                    if (Number(e.target.value) > 2147483647) {
                      return;
                    }
                    manejarCambio(e);
                  }}
                  className="input-sena"
                  placeholder="Ej: 1114309103"
                />
              </div>

              <div className='grupo-input-sena'>
                <label>Nombres</label>
                <input type="text" name="nombres" required value={formulario.nombres} onChange={manejarCambio} className='input-sena' placeholder="Ej: Carlos" />
              </div>

              <div className='grupo-input-sena'>
                <label>Apellidos</label>
                <input type="text" name="apellidos" required value={formulario.apellidos} onChange={manejarCambio} className='input-sena' placeholder="Ej: Mendoza" />
              </div>
            </div>

            {/* COLUMNA DERECHA: DETALLES DE LA VISITA */}
            <div className='columna-formulario'>
              <div className='grupo-input-sena el-textarea'>
                <label>Observación / Motivo de la visita</label>
                <textarea name="observacion" required rows="6" value={formulario.observacion} onChange={manejarCambio} className='input-sena' placeholder="Indique el motivo, oficina o persona con quien se dirige..."></textarea>
              </div>

              <div className='grupo-input-sena'>
                <label>Horas de Validez (Máx. 12 horas)</label>
                <input type="number" name="horas_validez" min="1" max="12" step="1" required value={formulario.horas_validez} onChange={manejarCambio} className='input-sena' />
              </div>
            </div>

            {/* BOTÓN GENERAL (Ocupa todo el ancho abajo) */}
            <div className='fila-boton-full'>
              <button type="submit" className='btn-sena-visitantes'>
                Generar QR de Acceso
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default Visitantes;