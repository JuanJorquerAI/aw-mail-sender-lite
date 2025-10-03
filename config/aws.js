const AWS = require('aws-sdk');

// Configurar AWS con las credenciales del archivo .env
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  console.log('AWS configurado correctamente en la región:', process.env.AWS_REGION || 'us-east-1');
  return AWS;
};

module.exports = {
  configureAWS
};