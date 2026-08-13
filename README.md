# ShipNow API

API de ShipNow refactorizada de un modelo monolítico a una arquitectura profesional por capas: **Controller → Service → Repository**, con configuración de entorno validada al arranque.

## Estructura del proyecto

\`\`\`
src/
  config/          # Carga y valida las variables de entorno (único lugar que toca process.env)
  utils/
    constants.js   # Objetos congelados: estados de producto, roles de usuario, status HTTP
  models/          # Schemas de Mongoose puros, sin lógica de negocio
  repositories/    # Único lugar que conoce Mongoose/MongoDB
  services/        # Lógica de negocio (validaciones, reglas, hashing, permisos)
  controllers/     # Manejan req/res y códigos de estado, sin conocer Mongoose
  routes/          # Sólo conectan cada path con su método del Controller
  app.js           # Arranque: config, conexión a Mongo, montaje de rutas
\`\`\`

## Instrucciones para correr el proyecto localmente

1. Clonar el repositorio e instalar dependencias:
   \`\`\`bash
   npm install
   \`\`\`
2. Copiar el archivo de ejemplo y completar los valores reales:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Variables requeridas: \`PORT\`, \`MONGODB_URI\`, \`NODE_ENV\`.
3. Levantar el servidor:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Si falta alguna variable obligatoria en \`.env\`, la aplicación no arranca y muestra un error indicando cuál falta.

## Por qué separé la lógica entre Service y Repository

El Repository sólo sabe "buscar y guardar datos": encapsula el acceso a Mongoose, define proyecciones por defecto (nunca devuelve \`password\`, por ejemplo) y expone métodos con nombre de dominio como \`existsByCode\`.

El Service concentra las reglas que dependen del negocio, no de la base de datos: calcular el \`status\` de un producto según su \`stock\`, hashear contraseñas, validar duplicados antes de crear, o decidir qué se muestra por defecto. El Controller queda "tonto" a propósito: sólo traduce \`req\` en una llamada al Service y el resultado en una respuesta HTTP.