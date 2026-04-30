// src/pages/Escaner.jsx
import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle, FaKeyboard } from 'react-icons/fa'; // Añadimos ícono de teclado

const Escaner = () => {
  const [pausarCamara, setPausarCamara] = useState(false);
  const [resultado, setResultado] = useState(null);
  
  // NUEVO: Estado para guardar el documento que el operario escribe a mano
  const [documentoManual, setDocumentoManual] = useState('');

  // --- FUNCIÓN AYUDANTE: EXTRACTOR DE DOCUMENTO ---
  const extraerDocumento = (textoLargo) => {
    const coincidencias = textoLargo.match(/\d+/g); 
    if (coincidencias && coincidencias.length > 0) return coincidencias[0]; 
    return textoLargo; 
  };

  // --- FUNCIÓN REUTILIZABLE: ENVIAR AL BACKEND ---
  // Separamos la lógica de enviar al backend para usarla tanto con la cámara como con el input manual
  const procesarAcceso = async (numeroDocumento) => {
    setResultado(null);

    try {
      // Enviamos el número al backend
      const respuesta = await api.post('/accesos/escanear', {
        id_qr: Number(numeroDocumento) 
      });

      const datos = respuesta.data.data;
      setResultado({
        tipo: 'exito',
        mensaje: respuesta.data.message, 
        accion: datos.accion,
        persona: `${datos.persona.nombres} ${datos.persona.apellidos}`,
        rol: datos.persona.tipo_persona
      });

    } catch (error) {
      setResultado({
        tipo: 'error',
        mensaje: error.response?.data?.message || 'Error al procesar el acceso.'
      });
    }

    // Limpiamos la alerta después de 4 segundos
    setTimeout(() => {
      setResultado(null);
      setPausarCamara(false);
      setDocumentoManual(''); // Limpiamos el input manual también
    }, 4000);
  };

  // 1. Cuando la cámara lee un QR
  const manejarEscaneo = (textoLeido) => {
    if (pausarCamara) return; 
    setPausarCamara(true);
    const numeroLimpio = extraerDocumento(textoLeido[0].rawValue);
    procesarAcceso(numeroLimpio); // Llamamos a nuestra función central
  };

  // 2. NUEVO: Cuando el operario envía el formulario manual
  const manejarEnvioManual = (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    if (!documentoManual) return;
    
    setPausarCamara(true); // Pausamos la cámara mientras procesamos esto
    procesarAcceso(documentoManual); // Llamamos a la MISMA función central
  };

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Control de Accesos</h2>
      <p style={{textAlign: 'center', marginBottom: '20px', color: '#4b5563'}}>
        Escanea el carnet o ingresa el documento manualmente.
      </p>

      {/* CÁMARA */}
      <div style={estilos.cajaCamara}>
        <Scanner 
          onScan={manejarEscaneo}
          paused={pausarCamara}
          formats={['qr_code']} 
        />
      </div>

      {/* NUEVO: FORMULARIO MANUAL */}
      <form onSubmit={manejarEnvioManual} style={estilos.formularioManual}>
        <div style={estilos.grupoInput}>
          <FaKeyboard style={estilos.iconoInput} />
          <input 
            type="number" 
            placeholder="Ej: 1114309103" 
            value={documentoManual}
            onChange={(e) => setDocumentoManual(e.target.value)}
            style={estilos.inputManual}
            disabled={pausarCamara} // Lo bloqueamos si el sistema está procesando algo
          />
        </div>
        <button type="submit" style={estilos.botonManual} disabled={pausarCamara}>
          Registrar
        </button>
      </form>

      {/* ALERTAS */}
      {resultado && (
        <div style={resultado.tipo === 'exito' ? estilos.alertaExito : estilos.alertaError}>
          {resultado.tipo === 'exito' ? <FaCheckCircle style={estilos.iconoAlerta} /> : <FaTimesCircle style={estilos.iconoAlerta} />}
          <div>
            <h3 style={{margin: '0 0 5px 0', fontSize: '18px'}}>{resultado.mensaje}</h3>
            {resultado.tipo === 'exito' && (
              <p style={{margin: 0, fontSize: '15px'}}>
                <strong>{resultado.persona}</strong> - {resultado.rol}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ... estilos anteriores más los nuevos para el input manual
const estilos = {
  contenedor: { maxWidth: '550px', margin: '0 auto', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  titulo: { color: '#39A900', textAlign: 'center', margin: '0 0 10px 0' },
  cajaCamara: { overflow: 'hidden', borderRadius: '12px', border: '4px solid #f3f4f6', marginBottom: '20px', backgroundColor: '#000', display: 'flex', justifyContent: 'center' },
  // Estilos Nuevos
  formularioManual: { display: 'flex', gap: '10px', marginBottom: '20px' },
  grupoInput: { display: 'flex', alignItems: 'center', flex: 1, backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 15px' },
  iconoInput: { color: '#9ca3af', marginRight: '10px' },
  inputManual: { border: 'none', backgroundColor: 'transparent', width: '100%', padding: '12px 0', outline: 'none', fontSize: '16px' },
  botonManual: { backgroundColor: '#39A900', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  // Estilos de alerta
  alertaExito: { display: 'flex', alignItems: 'center', backgroundColor: '#f0fdf4', color: '#15803d', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s ease' },
  alertaError: { display: 'flex', alignItems: 'center', backgroundColor: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca', animation: 'fadeIn 0.3s ease' },
  iconoAlerta: { fontSize: '35px', marginRight: '15px', flexShrink: 0 }
};

export default Escaner;