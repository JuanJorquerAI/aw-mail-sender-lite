# AW Mail Sender Lite

Aplicación de envío de correos electrónicos con múltiples proveedores y seguimiento de estadísticas.

## Características

- **Importación de contactos desde CSV**: Crea listas de contactos a partir de archivos CSV.
- **Múltiples proveedores de correo**: Soporte para AWS SES y SendGrid.
- **Envío de campañas**: Envía correos a listas completas de contactos.
- **Correos de prueba**: Envía correos de prueba antes de lanzar una campaña.
- **Seguimiento de estadísticas**: Monitorea aperturas de correos.
- **Opción de desuscripción**: Permite a los destinatarios desuscribirse fácilmente.

## Requisitos

- Node.js (v14 o superior)
- MongoDB (para almacenamiento de contactos y estadísticas)
- Cuenta de AWS SES y/o SendGrid

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/juanitodelrock/aw-mail-sender-lite.git
   cd aw-mail-sender-lite
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno:
   ```
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus credenciales.

## Configuración

### AWS SES

Para utilizar AWS SES, necesitas configurar:
- AWS Access Key ID
- AWS Secret Access Key
- AWS Region

### SendGrid

Para utilizar SendGrid, necesitas configurar:
- API Key de SendGrid

## Uso

1. Inicia la aplicación:
   ```
   npm run dev
   ```

2. Accede a la aplicación en tu navegador:
   ```
   http://localhost:3000
   ```

3. Configura tus proveedores de correo en la sección "Configuración".

4. Importa contactos desde un archivo CSV en la sección "Listas".

5. Envía campañas o correos de prueba desde las secciones correspondientes.

6. Consulta las estadísticas de apertura usando el ID de campaña.

## Estructura del proyecto

```
aw-mail-sender-lite/
├── config/           # Configuración de servicios
├── public/           # Archivos estáticos (HTML, CSS, JS)
├── services/         # Servicios de la aplicación
├── views/            # Plantillas EJS
├── uploads/          # Directorio para archivos subidos (creado automáticamente)
├── index.js          # Punto de entrada de la aplicación
└── package.json      # Dependencias y scripts
```

## Licencia

MIT