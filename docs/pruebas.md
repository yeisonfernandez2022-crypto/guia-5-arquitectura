# Pruebas y verificación

## Comandos

```powershell
cd backend
npm test
```

```powershell
cd frontend
npm install
npm test
```

## Resultados

| Suite | Pruebas | Resultado |
|---|---:|---|
| Backend | 30 | 30 aprobadas |
| Frontend | 13 | 13 aprobadas |
| Total | 43 | 43 aprobadas |

## Backend

### Dominio

- `Task.create()` normaliza título y descripción.
- `Task.create()` usa `pendiente` como estado inicial.
- `Task.create()` convierte `description: null` en cadena vacía.
- `Task.create()` rechaza títulos vacíos, cortos o que no son texto.
- `Task.fromPersistence()` conserva `id`, `createdAt`, `updatedAt` y estado.
- `Task.fromPersistence()` rechaza estados inválidos.
- `Task.changeStatus()` valida y actualiza `status` y `updatedAt`.
- `Task.clone()` devuelve una instancia independiente.

### Casos de uso

- `CreateTask` guarda una tarea válida y no guarda una inválida.
- `ChangeTaskStatus` actualiza una tarea existente.
- `ChangeTaskStatus` rechaza estados inválidos.
- `ChangeTaskStatus` devuelve `NotFoundError` para IDs inexistentes.
- `ListTasks` devuelve las tareas del repositorio.
- `GetTaskStatuses` devuelve una copia de los estados oficiales.

### Repositorio

- `findAll()` devuelve las tareas semilla.
- `findAll()` devuelve copias que no alteran el almacenamiento.
- `findById()` devuelve una copia.
- `save()` asigna IDs consecutivos a tareas nuevas.
- `save()` actualiza una tarea existente sin duplicarla.

### API

| Caso | Resultado |
|---|---|
| `GET /api/health` | `200` con `{ "status": "ok" }` |
| `GET /api/tasks` | `200` con las 2 tareas semilla |
| `POST /api/tasks` válido | `201`, título normalizado y estado `pendiente` |
| `POST /api/tasks` con `description: null` | `201`, descripción vacía |
| `POST /api/tasks` con título inválido | `400` |
| `PATCH /api/tasks/1/status` válido | `200`, estado actualizado |
| `PATCH` con estado inválido | `400` |
| `PATCH` con ID inexistente | `404` |
| `GET /api/tasks/statuses` | `200` con los 3 estados |
| Ruta inexistente | `404` en JSON |
| JSON mal formado | `400` en JSON |

## Frontend

### Modelo

- Guarda copias de las tareas.
- Guarda una copia de los estados.
- Ignora valores que no son arreglos.

### Vista con jsdom

- Renderiza las tarjetas y selecciona el estado actual.
- Escapa títulos peligrosos usando `textContent`; no crea elementos `img`.
- Muestra el mensaje cuando no hay tareas.
- Conecta formulario, refresco y cambio de estado.
- Actualiza clases visuales de mensajes y estado de la API.

### Controlador

- `init()` conecta la vista y carga tareas/estados.
- `createTask()` crea, limpia el formulario y recarga.
- Un error `400` muestra el mensaje sin marcar la API como caída.
- Un error de conexión marca `API no disponible` y muestra ayuda.
- `changeStatus()` delega en la API y recarga.

## Prueba de humo ejecutada

Se inició el servidor con `npm start` y se consultó la API con `Invoke-RestMethod`:

```text
Health              : ok
TareasIniciales     : 2
Estados             : pendiente, en progreso, finalizada
TareaCreada         : 3 | Tarea de humo | pendiente
TareaActualizada    : finalizada
FrontendStatus      : 200
FrontendTieneModulo : True
```

## Verificación arquitectónica

Búsquedas ejecutadas sin coincidencias:

```powershell
Get-ChildItem -Recurse -File backend\src\domain,backend\src\application |
  Select-String -Pattern "\bexpress\b|\breq\.|\bres\."

Get-ChildItem -Recurse -File backend\src\domain,backend\src\application |
  Select-String -Pattern "statusCode"

Get-ChildItem -Recurse -File frontend\src\models |
  Select-String -Pattern "document|window|innerHTML|fetch"

Get-ChildItem -Recurse -File backend\src\domain,backend\src\application,backend\src\interfaces,backend\src\infrastructure |
  Select-String -Pattern "new InMemoryTaskRepository"
```

También se validó la sintaxis de los 31 archivos JavaScript con `node --check`.

## Lista de verificación manual en navegador

Para completar la verificación visual:

1. Abrir `http://localhost:3000`.
2. Confirmar que aparecen las dos tareas semilla.
3. Crear una tarea con título válido y confirmar que aparece en el tablero.
4. Intentar crear una tarea con menos de 3 caracteres y confirmar el mensaje de error.
5. Cambiar el estado de una tarea y confirmar que se conserva al actualizar.
6. Detener el backend y pulsar "Actualizar"; confirmar el mensaje de API no disponible.
7. Crear una tarea con un título que contenga etiquetas HTML y confirmar que se muestra como texto, sin ejecutar código.
