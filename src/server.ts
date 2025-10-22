// Archivo de arranque del servidor HTTP
import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  await connectDB();

  const port = env.PORT;
  const server = app.listen(port, () => {
    console.log(`Server listening on :${port} (${env.NODE_ENV})`);
  });

  server.on('error', (err: any) => {
    console.error('HTTP server error:', err);
  });
}

start().catch((err: any) => {
  console.log('Failed to start:', err);
  process.exit(1);
});