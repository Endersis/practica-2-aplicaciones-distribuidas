const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// --- ÁREA DE CONFIGURACIÓN ---
const NOTIFICATION_SERVICE = 'telegram'; 
const TELEGRAM_TOKEN = '8284083041:AAGmwNNnlX9NUC-kog24dw5CmVBmjCQXi7I';
const CHAT_ID = '847764742';
const DISCORD_WEBHOOK_URL = 'URLhttps://discord.com/api/webhooks/1423055971822997667/iiYR6FqO90cVl1U7yp5fM7bwKBt2EpTAedkeG_hqTy6X3aJrypRqENc84DXs613a9Ngd';

// --- Lógica del Monitor ---
const TEMP_SERVICE_URL = 'http://localhost:3000/temperatura';
let consecutiveHighTemps = 0;
const HIGH_TEMP_THRESHOLD = 39;
const CONSECUTIVE_LIMIT = 3;
const POLLING_INTERVAL_MS = 30000;

// --- Módulos de Notificación ---
const bot = TELEGRAM_TOKEN ? new TelegramBot(TELEGRAM_TOKEN) : null;
const notifiers = {
  telegram: async (message) => {
    try {
      await bot.sendMessage(CHAT_ID, message);
      console.log('Notificación enviada a Telegram.');
    } catch (error) {
      console.error('Error al enviar a Telegram:', error.message);
    }
  },
  discord: async (message) => {
    try {
      await axios.post(DISCORD_WEBHOOK_URL, { content: message });
      console.log('Notificación enviada a Discord.');
    } catch (error) {
      console.error('Error al enviar a Discord:', error.message);
    }
  }
};

// --- Función "Interruptor" ---
async function sendNotification(message) {
  const service = NOTIFICATION_SERVICE;
  console.log(`Decidido enviar notificación a: ${service}`);

  if (service === 'telegram') {
    await notifiers.telegram(message);
  } else if (service === 'discord') {
    await notifiers.discord(message);
  } else if (service === 'ambos') {
    await notifiers.telegram(message);
    await notifiers.discord(message);
  } else {
    console.log('Servicio de notificación desconocido.');
  }
}

// --- Función Principal de Chequeo ---
async function checkTemperature() {
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

// --- Inicio del Script ---
console.log('Iniciando monitor de temperatura...');
setInterval(checkTemperature, POLLING_INTERVAL_MS);