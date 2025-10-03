require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const { sendEmail, sendTestEmail, getProviders } = require('./services/emailService');
const { saveSubscriber, unsubscribe, getSubscribers, getSubscriberLists, createList, trackOpen } = require('./services/subscriberService');
const { loadConfig, updateConfig } = require('./services/configService');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener listas de suscriptores
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await getSubscriberLists();
    res.json({ success: true, lists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ruta para obtener proveedores de email
app.get('/api/providers', async (req, res) => {
  try {
    const providers = getProviders();
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ruta para importar contactos desde CSV
app.post('/api/import-csv', upload.single('csvFile'), async (req, res) => {
  try {
    const { listName } = req.body;
    if (!req.file || !listName) {
      return res.status(400).json({ success: false, message: 'Se requiere un archivo CSV y un nombre de lista' });
    }

    const listId = await createList(listName);
    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (data) => {
        try {
          // Asumimos que el CSV tiene al menos una columna 'email'
          if (data.email) {
            const subscriber = {
              email: data.email,
              name: data.name || '',
              listId: listId,
              customFields: { ...data }
            };
            delete subscriber.customFields.email;
            delete subscriber.customFields.name;
            
            await saveSubscriber(subscriber);
            results.push(subscriber);
          }
        } catch (err) {
          errors.push({ email: data.email, error: err.message });
        }
      })
      .on('end', () => {
        // Eliminar el archivo después de procesarlo
        fs.unlinkSync(req.file.path);
        
        res.json({
          success: true,
          message: `Importación completada: ${results.length} contactos importados, ${errors.length} errores`,
          listId,
          results,
          errors
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ruta para enviar correo a una lista
app.post('/api/send-campaign', async (req, res) => {
  try {
    const { listId, subject, message, provider } = req.body;
    
    // Validaciones básicas
    if (!listId || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren los campos: listId, asunto y mensaje' 
      });
    }
    
    // Obtener suscriptores de la lista
    const subscribers = await getSubscribers(listId);
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La lista no tiene suscriptores'
      });
    }

    // Generar ID único para la campaña
    const campaignId = uuidv4();
    
    // Resultados del envío
    const results = [];
    const errors = [];
    
    // Enviar a cada suscriptor
    for (const subscriber of subscribers) {
      try {
        // Agregar pixel de seguimiento y enlace de desuscripción
        const trackingPixel = `<img src="${process.env.APP_URL || 'http://localhost:3000'}/track/${campaignId}/${subscriber._id}" width="1" height="1" />`;
        const unsubscribeLink = `${process.env.APP_URL || 'http://localhost:3000'}/unsubscribe/${subscriber._id}?email=${encodeURIComponent(subscriber.email)}`;
        
        // Personalizar mensaje con datos del suscriptor
        let personalizedMessage = message.replace(/{{nombre}}/g, subscriber.name || 'Suscriptor');
        Object.keys(subscriber.customFields || {}).forEach(field => {
          personalizedMessage = personalizedMessage.replace(new RegExp(`{{${field}}}`, 'g'), subscriber.customFields[field] || '');
        });
        
        // Agregar pixel y enlace de desuscripción
        personalizedMessage += `
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
            <p>Si no deseas recibir más correos, <a href="${unsubscribeLink}">haz clic aquí para desuscribirte</a>.</p>
            ${trackingPixel}
          </div>
        `;
        
        // Enviar email
        const result = await sendEmail(subscriber.email, subject, personalizedMessage, provider);
        results.push({ email: subscriber.email, messageId: result.MessageId });
      } catch (error) {
        errors.push({ email: subscriber.email, error: error.message });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Campaña enviada: ${results.length} enviados, ${errors.length} errores`,
      campaignId,
      results,
      errors
    });
  } catch (error) {
    console.error('Error al enviar campaña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar la campaña',
      error: error.message
    });
  }
});

// Ruta para enviar correo de prueba
app.post('/api/send-test', async (req, res) => {
  try {
    const { to, subject, message, provider } = req.body;
    
    // Validaciones básicas
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren los campos: destinatario, asunto y mensaje' 
      });
    }
    
    // Enviar email de prueba
    const result = await sendTestEmail(to, subject, message, provider);
    
    res.json({ 
      success: true, 
      message: 'Correo de prueba enviado exitosamente',
      messageId: result.MessageId
    });
  } catch (error) {
    console.error('Error al enviar correo de prueba:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar el correo de prueba',
      error: error.message
    });
  }
});

// Ruta para seguimiento de apertura de correos
app.get('/track/:campaignId/:subscriberId', async (req, res) => {
  try {
    const { campaignId, subscriberId } = req.params;
    await trackOpen(campaignId, subscriberId);
    
    // Devolver una imagen transparente de 1x1 pixel
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': img.length
    });
    res.end(img);
  } catch (error) {
    console.error('Error al registrar apertura:', error);
    res.status(500).end();
  }
});

// Ruta para desuscripción
app.get('/unsubscribe/:subscriberId', async (req, res) => {
  try {
    const { subscriberId } = req.params;
    const { email } = req.query;
    
    await unsubscribe(subscriberId, email);
    
    res.render('unsubscribe', { email });
  } catch (error) {
    console.error('Error al desuscribir:', error);
    res.status(500).send('Error al procesar la desuscripción');
  }
});

// Ruta para obtener estadísticas
app.get('/api/stats/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const stats = await getStats(campaignId);
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rutas de configuración
app.get('/api/settings', (req, res) => {
  try {
    const config = loadConfig();
    res.json({ success: true, settings: config });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const result = updateConfig(req.body);
    if (result) {
      res.json({ success: true, message: 'Configuración actualizada correctamente' });
    } else {
      res.json({ success: false, message: 'Error al actualizar la configuración' });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});