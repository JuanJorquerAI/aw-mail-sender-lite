import AWS, { config } from 'aws-sdk';

// Configurar AWS con las credenciales del archivo .env
const configureAWS = () => {
  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  console.log('AWS configurado correctamente en la región:', process.env.AWS_REGION || 'us-east-1');
  return AWS;
};

export default {
  configureAWS
};