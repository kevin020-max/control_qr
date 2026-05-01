import { useState } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const Visitantes = () => {
  // Estado para controlar los campos del formulario
  const [formulario, setFormulario] = useState({
    numero_documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    observacion: '',
    horas_validez: 2 // Por defecto 2 horas
  });

  // Estado para manejar alertas y mostrar el QR generado
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [qrGenerado, setQrGenerado] = useState(null); // Aquí guardaremos el documento para el QR

  // Función que actualiza el estado cuando el operario escribe en los inputs
  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  /// Función que se ejecuta al darle clic a "Registrar"
  const registrarVisitante = async (e) => {
    e.preventDefault(); // Evitamos que la página parpadee o se recargue
    setMensaje({ texto: 'Registrando...', tipo: 'info' }); // Mensaje de carga
    setQrGenerado(null); // Aseguramos que el QR empiece vacío

    try {
      // 1. Preparamos los datos tal cual los pide nuestro backend
      const datosAEnviar = {
        ...formulario,
        numero_documento: Number(formulario.numero_documento),
        horas_validez: Number(formulario.horas_validez)
      };

      // 2. Enviamos los datos al backend (Aquí ocurre la transacción mágica)
      const respuesta = await api.post('/visitantes/registrar', datosAEnviar);

      // 3. Mostramos el mensaje de éxito que nos devuelve Node.js
      setMensaje({ texto: respuesta.data.message || 'Visitante registrado con éxito', tipo: 'exito' });
      
      // 4. Generamos el QR: Para esto, le pasamos el número de documento que el backend usará para validar el acceso.
      setQrGenerado(datosAEnviar.numero_documento);
      
      // 5. Limpiamos el formulario en el fondo por si quieren registrar a alguien más después
      setFormulario({ 
        numero_documento: '', 
        tipo_doc: 'CC', 
        nombres: '', 
        apellidos: '', 
        observacion: '', 
        horas_validez: 2 
      });

    } catch (error) {
      // 6. Si algo falla, atrapamos el error y lo mostramos en rojo
      setMensaje({
        texto: error.response?.data?.message || 'Error al conectar con el servidor',
        tipo: 'error'
      });
    }
  };

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Registrar Nuevo Visitante</h2>
      <p style={{marginBottom: '20px', color: '#4b5563'}}>
        Completa los datos para generar el QR de acceso temporal.
      </p>

      {/* Si hay un mensaje (error o éxito), lo mostramos */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'error' ? estilos.alertaError : estilos.alertaExito}>
          {mensaje.texto}
        </div>
      )}

      {/* SI SE GENERÓ UN QR, LO MOSTRAMOS Y OCULTAMOS EL FORMULARIO */}
      {qrGenerado ? (
        <div style={estilos.cajaQr}>
          <h3 style={{color: '#39A900'}}>¡QR Generado con Éxito!</h3>
          <p>Tómale una foto a este código o imprímelo para el visitante.</p>
          
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px', display: 'inline-block' }}>
            {/* CORRECCIÓN: Usamos QRCodeSVG en lugar de QRCode */}
            <QRCodeSVG value={String(qrGenerado)} size={200} />
          </div>
          
          <br/>
          <button style={estilos.boton} onClick={() => setQrGenerado(null)}>
            Registrar Otro Visitante
          </button>
        </div>
      ) : (
        /* FORMULARIO DE REGISTRO */
        <form onSubmit={registrarVisitante} style={estilos.formulario}>
          <div style={estilos.filaDosColumnas}>
            <div style={estilos.grupoInput}>
              <label>Tipo Doc.</label>
              <select name="tipo_doc" value={formulario.tipo_doc} onChange={manejarCambio} style={estilos.input}>
                <option value="CC">Cédula</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula Extranjería</option>
              </select>
            </div>
            <div style={estilos.grupoInput}>
              <label>Número de Documento</label>
              <input type="number" name="numero_documento" required value={formulario.numero_documento} onChange={manejarCambio} style={estilos.input} />
            </div>
          </div>

          <div style={estilos.filaDosColumnas}>
            <div style={estilos.grupoInput}>
              <label>Nombres</label>
              <input type="text" name="nombres" required value={formulario.nombres} onChange={manejarCambio} style={estilos.input} />
            </div>
            <div style={estilos.grupoInput}>
              <label>Apellidos</label>
              <input type="text" name="apellidos" required value={formulario.apellidos} onChange={manejarCambio} style={estilos.input} />
            </div>
          </div>

          {/* Justificación de la visita[cite: 2, 4] */}
          <div style={estilos.grupoInput}>
            <label>Observación / Motivo de la visita</label>
            <textarea name="observacion" required rows="3" value={formulario.observacion} onChange={manejarCambio} style={estilos.input}></textarea>
          </div>

          {/* Validez del QR[cite: 2, 4] */}
          <div style={estilos.grupoInput}>
            <label>Horas de Validez (Máx. 2 horas)</label>
            <input type="number" name="horas_validez" min="1" max="2" required value={formulario.horas_validez} onChange={manejarCambio} style={estilos.input} />
          </div>

          <button type="submit" style={estilos.boton}>
            Generar QR de Acceso
          </button>
        </form>
      )}
    </div>
  );
};

// Estilos básicos en línea
const estilos = {
  contenedor: { maxWidth: '600px', margin: '0 auto', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  titulo: { color: '#39A900', margin: '0 0 5px 0' },
  formulario: { display: 'flex', flexDirection: 'column', gap: '15px' },
  filaDosColumnas: { display: 'flex', gap: '15px' },
  grupoInput: { display: 'flex', flexDirection: 'column', flex: 1, gap: '5px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', fontFamily: 'inherit' },
  boton: { backgroundColor: '#39A900', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  alertaExito: { backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '15px' },
  alertaError: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px' },
  cajaQr: { textAlign: 'center', backgroundColor: '#f9fafb', padding: '30px', borderRadius: '12px', border: '2px dashed #d1d5db' }
};

export default Visitantes;