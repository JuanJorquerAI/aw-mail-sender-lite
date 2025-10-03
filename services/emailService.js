const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

// Configurar proveedores
const configureProviders = () => {
  // Configurar AWS SES
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  // Configurar SendGrid
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
};

// Inicializar proveedores
configureProviders();

// Crear instancia de SES
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Obtiene la lista de proveedores disponibles
 * @returns {Array} - Lista de proveedores configurados
 */
const getProviders = () => {
  const providers = [
    { id: 'aws-ses', name: 'Amazon SES', available: !!process.env.AWS_ACCESS_KEY_ID }
  ];
  
  if (process.env.SENDGRID_API_KEY) {
    providers.push({ id: 'sendgrid', name: 'SendGrid', available: true });
  }
  
  return providers;
};

/**
 * Envía un correo electrónico usando el proveedor especificado
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} message - Contenido del correo (puede ser HTML)
 * @param {string} provider - ID del proveedor a utilizar (aws-ses, sendgrid)
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendEmail = async (to, subject, message, provider = 'aws-ses') => {
  switch (provider) {
    case 'sendgrid':
      return sendWithSendGrid(to, subject, message);
    case 'aws-ses':
    default:
      return sendWithSES(to, subject, message);
  }
};

/**
 * Envía un correo de prueba usando el proveedor especificado
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} message - Contenido del correo (puede ser HTML)
 * @param {string} provider - ID del proveedor a utilizar (aws-ses, sendgrid)
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendTestEmail = async (to, subject, message, provider = 'aws-ses') => {
  // Agregar prefijo [PRUEBA] al asunto
  const testSubject = `[PRUEBA] ${subject}`;
  
  // Agregar nota al final del mensaje
  const testMessage = `
    ${message}
    <div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
      <p><strong>Nota:</strong> Este es un correo de prueba enviado desde la aplicación de envío de correos.</p>
    </div>
  `;
  
  return sendEmail(to, testSubject, testMessage, provider);
};

/**
 * Envía un correo usando Amazon SES
 * @private
 */
const sendWithSES = async (to, subject, message) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: message,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Correo enviado con éxito (SES):', result.MessageId);
    return result;
  } catch (error) {
    console.error('Error al enviar correo con SES:', error);
    throw error;
  }
};

/**
 * Envía un correo usando SendGrid
 * @private
 */
const sendWithSendGrid = async (to, subject, message) => {
  const msg = {
    to: to,
    from: process.env.EMAIL_FROM,
    subject: subject,
    html: message,
  };

  try {
    const result = await sgMail.send(msg);
    console.log('Correo enviado con éxito (SendGrid):', result[0].statusCode);
    // Adaptar respuesta al formato de SES para mantener consistencia
    return {
      MessageId: `sendgrid_${Date.now()}`,
      ResponseMetadata: {
        RequestId: result[0].headers['x-message-id'] || 'unknown'
      }
    };
  } catch (error) {
    console.error('Error al enviar correo con SendGrid:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendTestEmail,
  getProviders
};