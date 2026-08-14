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
## Mocking y carga de datos de prueba (Módulo 2)

ShipNow incluye un módulo de mocking bajo `/api/mocks` para generar datos simulados de Usuarios, Pedidos y Entregas sin necesidad de cargarlos a mano. Sigue la misma arquitectura por capas: `mock.routes.js` → `mock.controller.js` → `mock.service.js` → (`user`, `pedido`, `entrega`).`repository.js`.

### Endpoints disponibles

**Generación en memoria** (no persiste nada en la base):

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=2` | Genera `qty` usuarios simulados (roles `cliente`/`repartidor`) |
| GET | `/api/mocks/pedidos?qty=2` | Genera `qty` pedidos simulados (status y prioridad de las constantes) |
| GET | `/api/mocks/entregas?qty=2` | Genera `qty` entregas simuladas |

**Carga controlada en MongoDB**:

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/mocks/seed/users?qty=10` | Inserta `qty` usuarios reales (password hasheada) |
| POST | `/api/mocks/seed/pedidos?qty=10` | Inserta `qty` pedidos, asociados a usuarios existentes (si no hay, primero crea usuarios) |
| POST | `/api/mocks/seed/entregas?qty=10` | Inserta `qty` entregas, asociadas a pedidos existentes y, cuando corresponde, a un repartidor real |

`qty` es opcional (default 5) y tiene un tope de 100 por request, para evitar cargas accidentales masivas.

### Cómo probarlo

```bash
# Ver la forma de los datos simulados sin tocar la base
curl "http://localhost:3000/api/mocks/users?qty=2"

# Sembrar datos reales, en orden (users -> pedidos -> entregas)
curl -X POST "http://localhost:3000/api/mocks/seed/users?qty=5"
curl -X POST "http://localhost:3000/api/mocks/seed/pedidos?qty=5"
curl -X POST "http://localhost:3000/api/mocks/seed/entregas?qty=5"
```

Si llamás `/seed/pedidos` sin haber sembrado usuarios antes, el Service crea automáticamente usuarios de base para poder asociar los pedidos (mismo criterio para `/seed/entregas` con pedidos). Esto garantiza que las relaciones (pedido↔usuario, entrega↔pedido, entrega↔repartidor) siempre queden consistentes.