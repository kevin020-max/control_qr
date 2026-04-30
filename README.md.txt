## 📱 Guía: Cómo probar el Escáner QR en un Dispositivo Móvil (Red Local)

Para que el aplicativo pueda utilizar la cámara de un teléfono celular y comunicarse correctamente con la base de datos en tu computadora, ambos dispositivos deben estar conectados a la **misma red Wi-Fi**. Sigue estos pasos para configurarlo:

### Paso 1: Averiguar la IP de tu Computadora
Necesitamos la dirección de tu equipo dentro de la red local.
1. Abre una terminal (Símbolo del sistema o PowerShell) en tu PC.
2. Ejecuta el comando: `ipconfig`
3. Busca la línea que dice **"Dirección IPv4"** y anota ese número (Ejemplo: `192.168.1.15`).

### Paso 2: Configurar el Frontend para escuchar en la Red
Por defecto, Vite solo funciona en `localhost`. Debemos decirle que exponga la aplicación a toda la red Wi-Fi.
1. En la carpeta `frontend`, abre el archivo `vite.config.js`.
2. Asegúrate de tener la propiedad `host: true` en la configuración del servidor:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone el frontend a la red local
    port: 5173,
  }
});