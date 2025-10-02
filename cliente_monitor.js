const axios = require('axios');
const nodemailer = require('nodemailer');

// --- Configuración ---
const URL_SERVICIO = 'http://localhost:3000/temperatura';
const UMBRAL_TEMPERATURA = 39;
const INTERVALO_SEGUNDOS = 30;

// Configuración para el envío de correos (usa tus credenciales)
const mailConfig = {
  host: 'smtp.gmail.com', // Servidor SMTP de tu proveedor
  port: 465,
  secure: true,
  auth: {
    user: 'alexisgt7168@gmail.com', // Tu dirección de correo
    pass: ' ' // Tu contraseña o contraseña de aplicación
  }
};

const destinatario = 'superman28_espuma@hotmail.com'; // A quién se le envía la alerta

// --- Lógica del Programa ---
let contadorAltasTemperaturas = 0;

/**
 * Envía una notificación por correo electrónico.
 */
async function enviarCorreoAlerta() {
  try {
    const transporter = nodemailer.createTransport(mailConfig);
    const info = await transporter.sendMail({
      from: `"Alerta de Temperatura" <${mailConfig.auth.user}>`,
      to: destinatario,
      subject: '⚠️ Alerta: Temperaturas Altas Detectadas',
      text: `Se han detectado 3 lecturas consecutivas por encima de ${UMBRAL_TEMPERATURA}°C.`,
      html: `<b>Alerta Crítica</b><p>Se han detectado 3 lecturas consecutivas por encima de ${UMBRAL_TEMPERATURA}°C.</p>`
    });
    console.log(`✅ Correo de alerta enviado: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
  }
}

/**
 * Función principal que consulta la temperatura y evalúa las condiciones.
 */
async function monitorearTemperatura() {
  try {
    const respuesta = await axios.get(URL_SERVICIO);
    const temperatura = respuesta.data.temperatura;
    console.log(`Temperatura recibida: ${temperatura}°C`);

    if (temperatura > UMBRAL_TEMPERATURA) {
      contadorAltasTemperaturas++;
      console.log(`🔥 Temperatura alta detectada. Conteo: ${contadorAltasTemperaturas}`);
    } else {
      // Si la temperatura no es alta, se reinicia el contador
      contadorAltasTemperaturas = 0;
      console.log('📉 Temperatura normal. Contador reiniciado.');
    }

    if (contadorAltasTemperaturas >= 3) {
      console.log('🚨 ¡ALERTA! Enviando notificación...');
      await enviarCorreoAlerta();
      // Se reinicia el contador para no enviar alertas continuamente
      contadorAltasTemperaturas = 0;
    }
  } catch (error) {
    console.error('❌ Error al consultar el servicio de temperatura:', error.message);
  }
}

// --- Ejecución ---
console.log('Iniciando monitoreo de temperatura...');
// Llama a la función una vez al inicio y luego cada 30 segundos
monitorearTemperatura();
setInterval(monitorearTemperatura, INTERVALO_SEGUNDOS * 1000);