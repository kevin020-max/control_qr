// src/pages/Escaner.jsx
import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Íconos para hacer la UI más amigable

const Escaner = () => {
  // --- ESTADOS DE LA PANTALLA ---
  // pausarCamara: Evita que el escáner lea 30 veces por segundo el mismo QR
  const [pausarCamara, setPausarCamara] = useState(false);
  // resultado: Guardará los datos del éxito o el mensaje de error para mostrarlo en pantalla
  const [resultado, setResultado] = useState(null); 

  // --- FUNCIÓN AYUDANTE: EXTRACTOR DE DOCUMENTO ---
  // Esta función toma el texto revuelto del carnet del SENA y saca solo los números
  const extraerDocumento = (textoLargo) => {
    // La expresión regular /\d+/g busca agrupaciones de solo números dentro del texto
    const coincidencias = textoLargo.match(/\d+/g); 

    // Si encontró números, asumiremos que el primero (o el más largo) es el documento
    if (coincidencias && coincidencias.length > 0) {
      // En "SAMUEL NUNEZ 1114309103", devolverá "1114309103"
      return coincidencias[0]; 
    }
    
    // Si por alguna razón escanean un QR que no tiene números, devolvemos el texto original
    return textoLargo; 
  };

  // --- FUNCIÓN PRINCIPAL: MANEJAR LA LECTURA DEL QR ---
  const manejarEscaneo = async (textoLeido) => {
    // 1. Si la cámara está en pausa (procesando un QR anterior), ignoramos la lectura
    if (pausarCamara) return; 

    // 2. Pausamos la cámara inmediatamente y limpiamos mensajes anteriores
    setPausarCamara(true);
    setResultado(null); 

    // 3. Extraemos el texto crudo que leyó la cámara
    const datosCrudosQR = textoLeido[0].rawValue;

    // 4. Pasamos el texto por nuestro "limpiador" para obtener solo el número
    const numeroLimpio = extraerDocumento(datosCrudosQR);

    console.log("============= LECTURA DE QR =============");
    console.log("Texto original del carnet:", datosCrudosQR);
    console.log("Número extraído (Cédula):", numeroLimpio);
    console.log("=========================================");

    // 5. Enviamos el número limpio al Backend
    try {
      // Envolvemos numeroLimpio en Number() para asegurar que Zod reciba un tipo numérico
      const respuesta = await api.post('/accesos/escanear', {
        id_qr: Number(numeroLimpio) 
      });

      // 6. Si el backend responde OK, extraemos los datos y los preparamos para la pantalla
      const datos = respuesta.data.data;
      setResultado({
        tipo: 'exito',
        mensaje: respuesta.data.message, // Ej: "Entrada registrada exitosamente"
        accion: datos.accion, // "ENTRADA" o "SALIDA"
        persona: `${datos.persona.nombres} ${datos.persona.apellidos}`,
        rol: datos.persona.tipo_persona
      });

    } catch (error) {
      // 7. Si el backend arroja error (ej: QR no existe, persona inactiva)
      setResultado({
        tipo: 'error',
        mensaje: error.response?.data?.message || 'Error al procesar el código QR en el servidor.'
      });
    }

    // 8. Temporizador: Esperamos 4 segundos para que el guardia lea el mensaje, 
    // luego limpiamos la alerta y reactivamos la cámara para el siguiente carnet.
    setTimeout(() => {
      setResultado(null);
      setPausarCamara(false);
    }, 4000);
  };

  // --- RENDERIZADO DE LA INTERFAZ (UI) ---
  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Escáner de Acceso</h2>
      <p style={{textAlign: 'center', marginBottom: '20px', color: '#4b5563'}}>
        Apunta el código QR del carnet a la cámara
      </p>

      {/* COMPONENTE DE LA CÁMARA */}
      <div style={estilos.cajaCamara}>
        <Scanner 
          onScan={manejarEscaneo}
          paused={pausarCamara}
          formats={['qr_code']} // Optimizamos para que solo busque códigos QR
        />
      </div>

      {/* SISTEMA DE ALERTAS (Se muestra solo si hay un resultado) */}
      {resultado && (
        <div style={resultado.tipo === 'exito' ? estilos.alertaExito : estilos.alertaError}>
          {/* Ícono dinámico según el resultado */}
          {resultado.tipo === 'exito' ? (
             <FaCheckCircle style={estilos.iconoAlerta} /> 
          ) : (
             <FaTimesCircle style={estilos.iconoAlerta} />
          )}
          
          {/* Texto de la alerta */}
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

// --- ESTILOS EN LÍNEA (CSS) ---
const estilos = {
  contenedor: { 
    maxWidth: '550px', 
    margin: '0 auto', 
    padding: '25px', 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
  },
  titulo: { 
    color: '#39A900', // Verde SENA
    textAlign: 'center',
    margin: '0 0 10px 0'
  },
  cajaCamara: { 
    overflow: 'hidden', 
    borderRadius: '12px', 
    border: '4px solid #f3f4f6', 
    marginBottom: '20px', 
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center'
  },
  alertaExito: { 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: '#f0fdf4', 
    color: '#15803d', 
    padding: '16px', 
    borderRadius: '8px', 
    border: '1px solid #bbf7d0',
    animation: 'fadeIn 0.3s ease'
  },
  alertaError: { 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: '#fef2f2', 
    color: '#b91c1c', 
    padding: '16px', 
    borderRadius: '8px', 
    border: '1px solid #fecaca',
    animation: 'fadeIn 0.3s ease'
  },
  iconoAlerta: { 
    fontSize: '35px', 
    marginRight: '15px',
    flexShrink: 0
  }
};

export default Escaner;