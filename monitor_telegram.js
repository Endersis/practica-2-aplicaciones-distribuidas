const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');

// =========================================================================
// --- ÁREA DE CONFIGURACIÓN ---
// =========================================================================

// Elige los servicios de notificación en un array.
// Opciones: 'telegram', 'discord', 'email'
const NOTIFICATION_SERVICES = ['email']; 

// URL de tu servicio de temperaturas
const TEMP_SERVICE_URL = 'http://localhost:3000/temperatura';

// Configuración de Email (PARA RELLENAR)
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'alexisgt7168@gmail.com', 
    pass: 'vfex koiu eikj xwcn'     
  }
};
const EMAIL_RECIPIENT = 'superman28_espuma@hotmail.com'; 

// Configuración de Telegram (¡DATOS INTEGRADOS!)
const TELEGRAM_TOKEN = '8284083041:AAGmwNNnlX9NUC-kog24dw5CmVBmjCQXi7I';
const CHAT_ID = '847764742';

// Configuración de Discord (opcional)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1423055971822997667/iiYR6FqO90cVl1U7yp5fM7bwKBt2EpTAedkeG_hqTy6X3aJrypRqENc84DXs613a9Ngd';

// Parámetros del monitor
const HIGH_TEMP_THRESHOLD = 39;
const CONSECUTIVE_LIMIT = 3;
const POLLING_INTERVAL_MS = 30000;



const bot = TELEGRAM_TOKEN ? new TelegramBot(TELEGRAM_TOKEN) : null;
const emailTransporter = nodemailer.createTransport(EMAIL_CONFIG);

const notifiers = {
  email: {
    send: async (message) => {
      try {
        await emailTransporter.sendMail({
          from: `"Monitor de Temperatura" <${EMAIL_CONFIG.auth.user}>`,
          to: EMAIL_RECIPIENT,
          subject: '🔴 Alerta de Temperatura Alta',
          text: message,
          html: `<b>${message}</b>`
        });
        console.log('Notificación enviada por Email exitosamente.');
      } catch (error) {
        console.error('Error al enviar notificación por Email:', error.message);
      }
    }
  },
  telegram: {
    send: async (message) => {
      if (!bot || !CHAT_ID) return console.error('Error: Faltan datos de Telegram.');
      try {
        await bot.sendMessage(CHAT_ID, message);
        console.log('Notificación enviada a Telegram exitosamente.');
      } catch (error) {
        console.error('Error al enviar notificación a Telegram:', error.message);
      }
    }
  },
  discord: {
    send: async (message) => {
      if (!DISCORD_WEBHOOK_URL) return console.error('Error: Falta URL de Discord.');
      try {
        await axios.post(DISCORD_WEBHOOK_URL, { content: message });
        console.log('Notificación enviada a Discord exitosamente.');
      } catch (error) {
        console.error('Error al enviar notificación a Discord:', error.message);
      }
    }
  }
};

async function sendNotification(message) {
  console.log(`Enviando notificación a los servicios: ${NOTIFICATION_SERVICES.join(', ')}`);
  
  const notificationPromises = NOTIFICATION_SERVICES.map(serviceName => {
    if (notifiers[serviceName]) {
      return notifiers[serviceName].send(message);
    }
    console.warn(`Servicio de notificación desconocido: "${serviceName}"`);
    return Promise.resolve();
  });
  
  await Promise.all(notificationPromises);
}

let consecutiveHighTemps = 0;

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

console.log(`Iniciando monitor. Notificaciones activas para: "${NOTIFICATION_SERVICES.join(', ')}"`);
setInterval(checkTemperature, POLLING_INTERVAL_MS);