# Análisis del proyecto base

Este documento describe las violaciones de separación de responsabilidades encontradas en el código original, su impacto y la forma en que fueron corregidas.

## Resumen

El backend ya tenía archivos con nombres de capas (`controller`, `service`, `repository`), pero las fronteras no estaban aisladas: la lógica de negocio conocía HTTP, el repositorio mezclaba persistencia con creación de entidades y el modelo no protegía sus invariantes. El frontend concentraba en un solo archivo el transporte HTTP, el estado, la vista, los eventos y reglas de presentación.

El resultado era alto acoplamiento (cambiar una capa obligaba a tocar otras) y baja cohesión (un archivo hacía muchas cosas no relacionadas).

## Violaciones identificadas

### 1. Frontend monolítico

**Evidencia:** `frontend/src/app.js:1-99`.

El archivo mezclaba:

- Configuración de la API (`API_URL`, línea 1).
- Cliente HTTP (`request`, líneas 13-21).
- Renderizado de tareas (`renderTasks`, líneas 23-47).
- Estado y carga de datos (`loadTasks`, líneas 49-60).
- Eventos del formulario, refresco y cambio de estado (líneas 62-97).
- Reglas de dominio duplicadas: la lista de estados estaba hardcodeada en la línea 40.
- Estilos inline para mensajes de error (líneas 56-57, 71, 75).

**Impacto:** cualquier cambio visual obligaba a revisar lógica de red; las reglas de estado estaban duplicadas entre frontend y backend; no había forma de probar las piezas por separado.

**Corrección:** separación en `api/taskApi.js`, `models/tasksModel.js`, `views/tasksView.js`, `controllers/tasksController.js` y `app.js` como punto de composición.

### 2. Lógica de negocio acoplada a HTTP

**Evidencia:** `backend/src/taskService.js:14-15,23-24,29-30`.

El servicio creaba errores con `error.statusCode = 400/404`, por lo que la capa de negocio conocía códigos HTTP. Además, `taskController.js:7` pasaba `req.body` directamente al servicio.

**Impacto:** el dominio dependía del mecanismo de transporte; reutilizar la lógica desde una CLI o un worker obligaba a arrastrar conceptos HTTP.

**Corrección:** errores `ValidationError` y `NotFoundError` en el dominio, y un middleware en `interfaces/http/errorHandler.js` que los traduce a `400` y `404`.

### 3. Modelo anémico y reglas duplicadas

**Evidencia:** `backend/src/domain.js:1-9`, `backend/src/taskService.js:1`, `frontend/src/app.js:40`, `backend/src/taskRepository.js:17`.

- `Task` solo asignaba propiedades, sin validar título ni estado.
- Los estados válidos vivían en el servicio y se repetían en el frontend.
- `createdAt` se reiniciaba en cada `new Task()`, lo que impedía rehidratar una tarea sin perder la fecha original.
- El repositorio creaba entidades directamente, saltándose cualquier invariante.

**Impacto:** las reglas se podían omitir según el camino de ejecución; la lista de estados podía desincronizarse; la entidad no era confiable.

**Corrección:** entidad `Task` con `create()`, `fromPersistence()`, `changeStatus()` y `clone()`; `TaskStatus` como única fuente de verdad; repositorio que siempre rehidrata mediante la entidad.

### 4. Repositorio con responsabilidades mezcladas y fuga de estado

**Evidencia:** `backend/src/taskRepository.js:5-31`.

- Los datos semilla y el contador de IDs estaban dentro del repositorio (líneas 5-10).
- La creación de entidades estaba en `create()` (líneas 16-20).
- `findAll()` devolvía un arreglo nuevo pero con las mismas instancias (líneas 12-14), así que un consumidor podía mutar el estado almacenado.
- `updateStatus()` mutaba directamente la tarea guardada (líneas 26-31).
- El servicio dependía de `TaskRepository` concreto, no de una abstracción (líneas 4-6).

**Impacto:** el almacenamiento no estaba encapsulado; cambiar a otra persistencia implicaba modificar el servicio; era fácil introducir efectos colaterales.

**Corrección:** contrato `TaskRepository`, implementación `InMemoryTaskRepository` con `Map`, semilla inyectada y devolución de copias mediante `Task.clone()`.

### 5. Composición, configuración y arranque mezclados

**Evidencia:** `backend/src/server.js:8-25`.

`server.js` creaba la app, configuraba middlewares, registraba rutas, definía el manejador de errores y llamaba a `listen`. No era posible importar la app para pruebas de integración sin abrir un puerto. También había CORS abierto y el handler devolvía `error.message` de cualquier error, incluyendo errores internos.

**Impacto:** baja testeabilidad y riesgo de filtrar detalles internos.

**Corrección:** `createApp()` en `app.js`, composición y arranque en `server.js`, configuración en `config.js`, middlewares separados y mensaje genérico para errores `500`.

### 6. Ausencia de pruebas y documentación

**Evidencia:** `backend/package.json:7-10` no tenía script de pruebas; no había carpeta de tests, README ni diagrama.

**Impacto:** no había forma objetiva de demostrar que el refactor conservaba el comportamiento ni de evitar regresiones.

**Corrección:** 30 pruebas de backend, 13 de frontend, README y documentos de análisis, arquitectura y verificación.

## Buenas piezas conservadas

- `taskRoutes.js` ya mantenía las rutas separadas del controlador.
- `taskController.js` ya era delgado y delegaba en el servicio.
- El frontend ya escapaba HTML en la versión original; el refactor mantiene la protección usando `textContent`.

## Comparación antes/después

| Aspecto | Antes | Después |
|---|---|---|
| Entidad | Objeto sin invariantes | `Task` con validación y fábricas |
| Estados | Duplicados en servicio y frontend | `TaskStatus` y endpoint de metadatos |
| Errores | `statusCode` en el servicio | Errores de dominio y middleware HTTP |
| Repositorio | Clase concreta con estado mutable expuesto | Puerto + implementación con copias |
| Composición | Todo en `server.js` | `app.js`, `server.js` y `config.js` |
| Frontend | Un archivo de 99 líneas | API, modelo, vista y controlador separados |
| Pruebas | Ninguna | 43 pruebas automatizadas |

## Conclusión

La refactorización no cambió el comportamiento funcional del CRUD: mantiene las rutas, los estados y los códigos de respuesta existentes, y agrega únicamente el endpoint de metadatos de estados. La mejora principal está en las fronteras: cada capa tiene una responsabilidad clara y las dependencias apuntan hacia el dominio.
