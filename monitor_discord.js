const axios = require('axios');

// --- CONFIGURACIÓN ---
const DISCORD_WEBHOOK_URL = 'URLhttps://discord.com/api/webhooks/1423055971822997667/iiYR6FqO90cVl1U7yp5fM7bwKBt2EpTAedkeG_hqTy6X3aJrypRqENc84DXs613a9Ngd'; // <-- REEMPLAZA ESTO
const TEMP_SERVICE_URL = 'http://localhost:3000/temperatura'; // <-- AJUSTA ESTA URL
// --------------------

let consecutiveHighTemps = 0;
const HIGH_TEMP_THRESHOLD = 39;
const CONSECUTIVE_LIMIT = 3;
const POLLING_INTERVAL_MS = 30000;

/**
 * Envía un mensaje a un canal de Discord usando un Webhook.
 * @param {string} message El texto del mensaje a enviar.
 */
async function sendNotification(message) {
  try {
    // Los webhooks de Discord esperan un objeto JSON con una propiedad "content"
    const payload = {
      content: message
    };
    await axios.post(DISCORD_WEBHOOK_URL, payload);
    console.log('Notificación enviada a Discord exitosamente.');
  } catch (error) {
    console.error('Error al enviar notificación a Discord:', error.message);
  }
}

async function checkTemperature() {
  // ... (El resto de la función es EXACTAMENTE IGUAL que en el código base)
  try {
    const response = await axios.get(TEMP_SERVICE_URL);
    const temperature = response.data.temperatura; 

    console.log(`Temperatura recibida: ${temperature}°C. Consecutivas altas: ${consecutiveHighTemps}`);

    if (temperature > HIGH_TEMP_THRESHOLD) {
      consecutiveHighTemps++;
    } else {
      consecutiveHighTemps = 0;
    }

    if (consecutiveHighTemps >= CONSECUTIVE_LIMIT) {
      const alertMessage = `¡ALERTA! Se han detectado ${consecutiveHighTemps} temperaturas consecutivas por encima de ${HIGH_TEMP_THRESHOLD}°C. Última lectura: ${temperature}°C.`;
      console.log('Enviando notificación...');
      
      await sendNotification(alertMessage);
      
      consecutiveHighTemps = 0;
    }
  } catch (error) {
    console.error('Error al consultar el servicio de temperatura:', error.message);
    consecutiveHighTemps = 0;
  }
}

console.log('Iniciando monitor de temperatura con notificaciones a Discord...');
setInterval(checkTemperature, POLLING_INTERVAL_MS);