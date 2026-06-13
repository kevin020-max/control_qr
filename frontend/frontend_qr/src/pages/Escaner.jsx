import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/Escaner.css'; // Cargamos los estilos limpios

const Escaner = () => {
  const [pausarCamara, setPausarCamara] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [documentoManual, setDocumentoManual] = useState('');

  const extraerDocumento = (textoLargo) => {
    const coincidencias = textoLargo.match(/\d+/g); 
    if (coincidencias && coincidencias.length > 0) return coincidencias[0]; 
    return textoLargo; 
  };

  const procesarAcceso = async (numeroDocumento) => {
    setResultado(null);
    try {
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

    // Dejamos los datos en pantalla por 5 segundos antes de reactivar la cámara
    setTimeout(() => {
      setResultado(null);
      setPausarCamara(false);
      setDocumentoManual('');
    }, 3000);
  };

  const manejarEscaneo = (textoLeido) => {
    if (pausarCamara) return; 
    setPausarCamara(true);
    const numeroLimpio = extraerDocumento(textoLeido[0].rawValue);
    procesarAcceso(numeroLimpio);
  };

  const manejarEnvioManual = (e) => {
    e.preventDefault();
    if (!documentoManual) return;
    setPausarCamara(true);
    procesarAcceso(documentoManual);
  };

  return (
    <div className="modulo-escaner">
      <h1 className="titulo">Escanear código QR</h1>
      <p className="subtitulo">
        Escanee o ingrese manualmente el código QR para registrar entrada o salida.
      </p>

      {/* CONTENEDOR GRID EN DOS COLUMNAS */}
      <div className="grid-escaner">
        
        {/* COLUMNA 1: ESCÁNER / CÁMARA */}
        <div className="tarjeta-escaner">
          <h3>Cámara de control</h3>
          <div className="caja-camara">
            <Scanner 
              onScan={manejarEscaneo}
              paused={pausarCamara}
              formats={['qr_code']} 
            />
          </div>
        </div>

        {/* COLUMNA 2: PANTALLA DE RESULTADOS Y REGISTRO MANUAL */}
        <div className="tarjeta-escaner">
          <h3>Información del perfil</h3>

          {/* Si no se ha escaneado nada, muestra mensaje neutral */}
          {!resultado && (
            <div className="esperando-lectura">
              <p>Esperando lectura de código QR o ingreso manual...</p>
            </div>
          )}

          {/* Si hay un resultado (Éxito o Error), se pinta de forma fija aquí */}
          {resultado && (
            <div className="perfil-resultado">
              {resultado.tipo === 'exito' ? (
                <>
                  <div className="info-campo">
                    <label>Nombre Completo:</label>
                    <span>{resultado.persona}</span>
                  </div>
                  <div className="info-campo">
                    <label>Rol institucional:</label>
                    <span>{resultado.rol}</span>
                  </div>
                  <div className="info-campo">
                    <label>Operación realizada:</label>
                    <span style={{color: '#39A900', fontWeight: 'bold'}}>{resultado.accion}</span>
                  </div>
                  
                  <div className="status-banner exito">
                    <FaCheckCircle /> <span>{resultado.mensaje}</span>
                  </div>
                </>
              ) : (
                <div className="status-banner error" style={{marginTop: 'auto', marginBottom: 'auto'}}>
                  <FaTimesCircle style={{fontSize: '24px'}} /> <span>{resultado.mensaje}</span>
                </div>
              )}
            </div>
          )}

          {/* FORMULARIO MANUAL SIEMPRE VISIBLE AL FONDO */}
          <form onSubmit={manejarEnvioManual} className="formulario-manual">
            <div className="grupo-input">
              <input 
                type="number" 
                placeholder="N° Documento" 
                className="input-manual"
                value={documentoManual}
                onChange={(e) => setDocumentoManual(e.target.value)}
                disabled={pausarCamara}
                required
              />
            </div>
            <button type="submit" className="boton-manual" disabled={pausarCamara}>
              Registrar
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Escaner;