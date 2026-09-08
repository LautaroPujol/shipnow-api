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
## Manejo centralizado de errores (Módulo 3)

Todos los errores de la API responden con la misma estructura, sin importar en qué capa o entidad ocurran:

```json
{
  "status": "error",
  "type": "PRODUCT_NOT_FOUND",
  "message": "Producto no encontrado.",
  "details": null
}
```

- `type`: identificador estable del error (útil para manejarlo programáticamente desde un frontend).
- `message`: mensaje legible para mostrar al usuario.
- `details`: información extra opcional sobre el error (por ejemplo, qué dato inválido se recibió). Puede ser `null`.

### Arquitectura de la capa de errores

\`\`\`
src/errors/
  enums.js            # Catálogo de tipos de error del dominio (ej. PRODUCT_NOT_FOUND)
  errorDictionary.js  # Mapea cada tipo a un statusCode HTTP y un mensaje default
  CustomError.js       # Clase de error que extiende Error, con type/statusCode/details
  errorFactory.js      # createError(type, opts) -> arma un CustomError listo para lanzar
src/middlewares/
  errorHandler.js      # Middleware global (4 parámetros) que arma la respuesta HTTP final
\`\`\`


Los Services detectan las condiciones de error y hacen `throw createError(ERROR_TYPES.X)`. Los Controllers nunca arman una respuesta de error: si algo falla, hacen `catch (error) { return next(error) }`, y es el middleware global (montado al final de `app.js`) el único lugar que decide el código HTTP y el JSON de respuesta.

### Validaciones del módulo de mocks

El módulo `/api/mocks` valida la cantidad (`qty`) recibida por query string antes de generar o insertar nada:

- `qty` ausente → usa el default (5).
- `qty` no numérico, decimal, negativo o cero → `400 INVALID_MOCK_QTY`.
- `qty` mayor a 100 → `400 INVALID_MOCK_QTY` con el máximo permitido.

Además, los endpoints `POST /api/mocks/seed/*` atrapan cualquier falla durante la inserción en MongoDB y responden `500 MOCK_SEED_FAILED` en vez de dejar pasar el error crudo de Mongoose.

### Cómo probar casos inválidos

```bash
# Cantidad negativa
curl "http://localhost:3000/api/mocks/users?qty=-5"

# Cantidad no numérica
curl "http://localhost:3000/api/mocks/pedidos?qty=abc"

# Recurso inexistente
curl "http://localhost:3000/api/products/000000000000000000000000"

# Rol inválido al actualizar un usuario
curl -X PUT "http://localhost:3000/api/users/<id>" -H "Content-Type: application/json" -d "{\"role\":\"superadmin\"}"
```

Todos deberían devolver la misma estructura `{ status, type, message, details }`, con el `statusCode` HTTP correspondiente (400 para errores de validación, 404 para recursos no encontrados, 500 para fallas internas o de base de datos).

## Logging y monitoreo (Módulo 4)

ShipNow usa **Winston** como logger centralizado, configurado en `src/config/logger.js`, con salida a consola y a archivo.

### Niveles de log

De más grave a menos grave: `fatal`, `error`, `warning`, `info`, `http`, `debug`.

- **`fatal`**: fallas críticas de arranque (ej. no se pudo conectar a MongoDB al iniciar).
- **`error`**: errores inesperados del servidor, o fallas de base de datos durante una operación.
- **`warning`**: errores esperados/de negocio (recurso no encontrado, dato inválido) y eventos a vigilar (ruta inexistente).
- **`info`**: eventos relevantes que sí ocurren en producción (servidor iniciado, conexión a Mongo, datos de prueba insertados).
- **`http`**: trazas de requests.
- **`debug`**: información técnica solo útil en desarrollo (stack traces completos, generación de mocks en memoria).

### Comportamiento según entorno

El nivel activo depende de `NODE_ENV` (variable validada en `src/config/index.js`, Módulo 1):

- **`development`**: se muestran todos los niveles, incluido `debug`.
- **`production`**: solo `info`, `warning`, `error` y `fatal` — se omiten `http` y `debug` para reducir ruido.

### Persistencia y rotación de archivos

Los niveles `error` y `fatal` se guardan además en archivos dentro de la carpeta `logs/`, con rotación diaria (`winston-daily-rotate-file`): un archivo nuevo por día (`error-YYYY-MM-DD.log`), máximo 20MB por archivo, y se conservan solo los últimos 14 días.

La carpeta `logs/` está en `.gitignore` — los archivos de log no se suben al repositorio, solo se generan localmente al correr la aplicación.

### Endpoint de prueba del logger

`GET /api/logs/test` dispara un log de cada uno de los 6 niveles, para verificar rápidamente que la configuración funciona (no representa funcionalidad real de negocio, es una herramienta interna).

```bash
curl "http://localhost:3000/api/logs/test"
```

Después de llamarlo, revisá la consola (deberían verse los 6 niveles) y el archivo más reciente en `logs/` (solo debería tener las líneas de `error` y `fatal`):

```bash
# En PowerShell
Get-Content logs\error-*.log
```

## Documentación de la API con Swagger (Módulo 5)

La API cuenta con documentación interactiva generada con **Swagger/OpenAPI** (`swagger-jsdoc` + `swagger-ui-express`), disponible en: http://localhost:3000/api/docs

Desde ahí se puede consultar cada endpoint (método, ruta, parámetros, body esperado, respuestas) y probarlo directamente con el botón "Try it out", sin necesidad de Postman ni curl.

### Estructura de la documentación

- `src/config/swagger.js`: configuración central (info general, servidores, tags, schemas reutilizables). Separada por completo de la lógica de rutas.
- Cada archivo de `src/routes/*.js` incluye sus propios comentarios `@swagger` documentando sus endpoints — `swagger-jsdoc` los lee automáticamente al arrancar el servidor.

### Módulos documentados (tags)

| Tag | Endpoints |
|---|---|
| **Users** | CRUD de usuarios (`/api/users`) |
| **Products** | CRUD de productos (`/api/products`) |
| **Orders** | CRUD de pedidos (`/api/pedidos`) |
| **Deliveries** | CRUD de entregas (`/api/entregas`) |
| **Mocks** | Generación en memoria y carga en MongoDB de datos de prueba (`/api/mocks`) |
| **Logger** | Endpoint de prueba del sistema de logging (`/api/logs/test`) — herramienta interna de validación, no funcionalidad de negocio |

### Schemas reutilizables

`Usuario`, `Producto`, `Pedido`, `Entrega`, `ItemPedido`, más los genéricos `SuccessResponse` y `ErrorResponse` (esta última refleja exactamente la estructura del middleware de errores del Módulo 3: `{ status, type, message, details }`).

### Aclaración importante

Para que `Orders`/`Deliveries` tuvieran endpoints reales que documentar (y no solo schemas sin uso), este módulo agregó un CRUD real de Pedidos y Entregas (`src/services/pedido.service.js`, `entrega.service.js`, y sus respectivos controllers/repositories/routes), reutilizando los modelos y tipos de error (`PEDIDO_NOT_FOUND`, `ENTREGA_NOT_FOUND`, `INVALID_PEDIDO_STATUS`) que ya existían desde los Módulos 2 y 3. Antes de este módulo, Pedidos y Entregas solo se generaban vía `/api/mocks`.

### Cómo probar

1. Levantar el servidor: `npm run dev`.
2. Abrir `http://localhost:3000/api/docs` en el navegador.
3. Desplegar cualquier endpoint, click en "Try it out", completar los parámetros/body de ejemplo, y "Execute".
4. Para ver un error documentado en acción, por ejemplo: crear un pedido (`POST /api/pedidos`) con un `usuario` real (obtenido de `GET /api/users`) y `status: "no_existe"` — debería devolver `400 INVALID_PEDIDO_STATUS`, tal como está documentado.

## Testing funcional (Módulo 6)

La API cuenta con una suite de tests funcionales automatizados, escritos con **Mocha** (organización/ejecución), **Chai** (aserciones) y **Supertest** (peticiones HTTP contra la app de Express, sin levantar un servidor real).

### Cómo ejecutar los tests

```bash
npm test
```

### Entorno de testing

Los tests corren contra una base de datos **separada** de desarrollo (`shipnow_test`, en el mismo cluster de Atlas), usando su propio archivo de variables de entorno: `.env.test` (no se sube al repositorio — está en `.gitignore`, igual que `.env`).

Variables requeridas en `.env.test`:

```
PORT=3001
MONGODB_URI=<connection string de tu cluster, apuntando a una base de testing distinta, ej. "shipnow_test">
NODE_ENV=test
```

Como red de seguridad, `test/setup.js` **aborta la suite** si la `MONGODB_URI` de test no incluye `shipnow_test` en el nombre de la base — así se evita borrar datos reales por error.

### Separación app / servidor

`src/app.js` exporta únicamente la app de Express (rutas, middlewares), sin conectar a Mongo ni levantar un puerto. `src/server.js` es el punto de entrada real: importa la app, conecta a MongoDB y hace `listen`. Esto permite que los tests importen `app.js` directamente y usen Supertest sin abrir un servidor real.

### Estrategia de datos y limpieza

- Los tests crean sus propios datos (ej. un usuario antes de crear un pedido asociado) en vez de depender de datos cargados manualmente.
- Los emails/identificadores usan timestamps para evitar colisiones entre corridas.
- Al finalizar toda la suite (`afterAll` en `test/setup.js`), se vacían todas las colecciones de la base de test y se cierra la conexión — cada corrida arranca sobre una base limpia.

### Módulos cubiertos

| Archivo | Cubre |
|---|---|
| `test/users.test.js` | Listar usuarios, crear usuario válido, email duplicado (400), usuario inexistente (404) |
| `test/pedidos.test.js` | Crear pedido válido, pedido sin usuario, status inválido (400), consultar por id (200/404), actualizar estado (200/400) |
| `test/mocks.test.js` | Generación en memoria, cantidades inválidas (negativa, no numérica, excedida), carga real en MongoDB (`/seed`) |
| `test/logger-and-docs.test.js` | Endpoint de prueba del logger, ruta de Swagger (`/api/docs`), ruta inexistente (404) |
| `test/uploads.test.js` | Carga de documentos de usuario y comprobantes de pedido/entrega: éxito, archivo faltante, tipo de documento inválido, archivo excede tamaño máximo, tipo de archivo no permitido, entidad inexistente |
| `test/products.test.js` | CRUD completo de productos: listar, crear, código duplicado (400), consultar por id (200/404), actualizar stock (recalcula status), eliminar (204/404) |
| `test/entregas.test.js` | Crear entrega, pedido inexistente (404), repartidor con rol inválido (400), consultar por id (200/404), marcar como entregada, eliminar |

Cada test valida no solo el status HTTP, sino la estructura del body de respuesta (`status`, `type`, `message`, `details` en errores; propiedades relevantes del `payload` en casos exitosos), coherente con el formato definido en el módulo de manejo de errores.

## Carga de archivos (Módulo 7)

ShipNow permite subir y gestionar archivos con **Multer**, asociándolos a entidades del sistema. Los archivos se guardan en disco; en MongoDB solo se persisten sus **metadatos**.

### Configuración

`src/config/multer.js` centraliza la configuración (separada de los routers):

- **Almacenamiento**: en disco (`diskStorage`), organizado en subcarpetas por tipo dentro de `uploads/` (`documentos-usuario/`, `comprobantes/`).
- **Nombres de archivo**: generados con timestamp + número aleatorio, conservando la extensión original — nunca se usa el nombre que sube el cliente para evitar colisiones o nombres maliciosos.
- **Tipos permitidos**: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.
- **Tamaño máximo**: 5MB por archivo.

La carpeta `uploads/` está en `.gitignore` (solo se versionan las subcarpetas vacías vía `.gitkeep`) — los archivos subidos nunca se suben al repositorio.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/users/:id/documentos` | Sube un documento (`archivo` + `tipoDocumento`) y lo asocia a un usuario |
| POST | `/api/pedidos/:id/comprobante` | Sube un comprobante (`archivo`) y lo asocia a un pedido |
| POST | `/api/entregas/:id/comprobante` | Sube un comprobante (`archivo`) y lo asocia a una entrega |

Los tres reciben `multipart/form-data` y están documentados en Swagger con esa forma (ver `/api/docs`, secciones Users/Orders/Deliveries).

### Validaciones y errores

Conectadas al sistema de errores centralizado del Módulo 3:

- `FILE_REQUIRED` (400): no se adjuntó ningún archivo.
- `INVALID_FILE_TYPE` (400): el tipo MIME no está permitido (lo detecta Multer antes de guardar nada).
- `FILE_TOO_LARGE` (400): el archivo supera los 5MB.
- `INVALID_DOCUMENT_TYPE` (400): el `tipoDocumento` enviado no es uno de los válidos (`dni`, `licencia_conducir`, `otro`).
- `USER_NOT_FOUND` / `PEDIDO_NOT_FOUND` / `ENTREGA_NOT_FOUND` (404): la entidad indicada no existe.
- `FILE_SAVE_FAILED` (500): falló el guardado de metadata en la base.

Si el archivo llega a guardarse en disco pero la validación posterior falla (entidad inexistente, tipo de documento inválido), el Service elimina el archivo huérfano automáticamente.

### Logging

El logger registra: carga exitosa (`info`), intento sobre entidad inexistente o tipo de documento inválido (`warning`), y fallas al guardar (`error`).

### Cómo probarlo

```bash
curl -X POST "http://localhost:3000/api/users/<idUsuario>/documentos" \
  -F "archivo=@dni.pdf" \
  -F "tipoDocumento=dni"

curl -X POST "http://localhost:3000/api/pedidos/<idPedido>/comprobante" \
  -F "archivo=@comprobante.jpg"
```

### Tests

`test/uploads.test.js` cubre: carga exitosa de un documento (con verificación de metadata y que `password` no se filtre), archivo faltante, tipo de documento inválido, y entidad inexistente (usuario y pedido).

## Performance, producción y Docker (Módulo 8)

### Paginación

Los listados grandes (`GET /api/users`, `GET /api/pedidos`, `GET /api/entregas`) soportan `?page` y `?limit` (default: página 1, 10 resultados; máximo 100 por página). La respuesta incluye un campo `meta` con `page`, `limit`, `totalDocs`, `totalPages`:

```bash
curl "http://localhost:3000/api/users?page=1&limit=10"
```

### Health check

`GET /api/health` devuelve el estado de la API sin exponer datos sensibles:

```json
{ "status": "ok", "environment": "development", "uptime": 123.45, "timestamp": "2026-..." }
```

### Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `PORT` | Sí | Puerto en el que escucha la API |
| `MONGODB_URI` | Sí | Connection string de MongoDB |
| `NODE_ENV` | Sí | `development` \| `test` \| `production` |
| `LOG_LEVEL` | No | Fuerza el nivel de log de Winston (por defecto: `debug` en dev, `info` en producción) |

Ver `.env.example` (desarrollo) y `.env.test.example` (testing) como plantilla. La app valida `PORT`, `MONGODB_URI` y `NODE_ENV` al arrancar y no inicia si falta alguna, con un mensaje de error claro.

### Criterio sobre endpoints internos en producción

`/api/mocks`, `/api/logs/test` y `/api/docs` quedan **bloqueados** (404) cuando `NODE_ENV=production`, vía el middleware `src/middlewares/blockInProduction.js`. Motivo: mocks permite insertar datos falsos en la base real, el logger de prueba es solo diagnóstico interno, y Swagger expone la estructura completa de la API — ninguno debería ser público en un entorno productivo real.

### Docker

Construir la imagen:

```bash
docker build -t shipnow-api .
```

Ejecutar el contenedor (usando tu `.env` local para las variables):

```bash
docker run -p 3000:3000 --env-file .env shipnow-api
```

La API queda disponible en `http://localhost:3000`. Con el contenedor corriendo, se puede probar `GET /api/health`, `GET /api/docs` y cualquier endpoint principal (ej. `GET /api/products`) igual que en local.

`.dockerignore` excluye `node_modules`, `.env*`, `.git`, `logs`, `uploads`, `test`, `coverage` y archivos Markdown — la imagen solo contiene `src/`, `package.json` y `package-lock.json`.

### Logs y uploads en Docker

Los logs (`logs/`) y los archivos subidos (`uploads/`) no se copian a la imagen ni se versionan en el repo — en un despliegue real, esas carpetas deberían montarse como volúmenes externos si se necesita persistencia entre reinicios del contenedor.