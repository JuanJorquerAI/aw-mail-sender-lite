const fs = require('fs');
const path = require('path');

// Ruta al archivo de configuración
const configPath = path.join(__dirname, 'config.json');

// Configuración por defecto
const defaultConfig = {
  aws: {
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  },
  sendgrid: {
    apiKey: ''
  },
  mongodb: {
    uri: 'mongodb://localhost:27017/mailsender'
  },
  defaultProvider: 'aws-ses'
};

// Cargar configuración
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } else {
      // Si no existe el archivo, crear uno con la configuración por defecto
      saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error('Error al cargar la configuración:', error);
    return defaultConfig;
  }
}

// Guardar configuración
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    return false;
  }
}

// Actualizar configuración
function updateConfig(newConfig) {
  const currentConfig = loadConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  return saveConfig(updatedConfig);
}

module.exports = {
  loadConfig,
  saveConfig,
  updateConfig
};