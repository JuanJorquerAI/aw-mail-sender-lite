// Archivo de arranque del servidor HTTP

import app from './app.js';
import env from './config/env.js';

const port = env.PORT;

const server = app.listen(port, () => {
  console.log(`Server listening on :${port} (${env.NODE_ENV})`);
});

// Opcional: manejo básico de errores del servidor
server.on('error', (err: any) => {
  console.error('HTTP server error:', err);
});
