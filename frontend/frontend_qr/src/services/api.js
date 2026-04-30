import axios from 'axios';

// 1. Creamos la instancia base de Axios
const api = axios.create({
  // Definimos la URL base de nuestro backend (Node.js)
  baseURL: 'http://172.30.2.188:3000/api',
  // Configuramos que el contenido por defecto sea JSON
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. CONFIGURAMOS UN INTERCEPTOR DE PETICIÓN (Request Interceptor)
// Este código se ejecuta "automáticamente" antes de que cualquier petición salga hacia el servidor.
api.interceptors.request.use(
  (config) => {
    // Intentamos obtener el token que guardaremos en el localStorage del navegador
    const token = localStorage.getItem('token');

    // Si el token existe, lo añadimos a las cabeceras de autorización
    // Recuerda que nuestro backend espera el formato: Bearer <token>
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Si hay un error antes de enviar la petición, lo rechazamos
    return Promise.reject(error);
  }
);

// 3. CONFIGURAMOS UN INTERCEPTOR DE RESPUESTA (Response Interceptor)
// Útil para manejar errores globales, como cuando el token expira (Error 401)
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la dejamos pasar tal cual
  (error) => {
    // Si el backend nos responde con un 401 (No autorizado), 
    // significa que el token venció o es inválido.
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o inválida. Redirigiendo al login...');
      localStorage.removeItem('token'); // Limpiamos la basura
      // Podríamos forzar un redireccionamiento aquí si fuera necesario
    }
    return Promise.reject(error);
  }
);

export default api; // Exportamos nuestra herramienta lista para usar