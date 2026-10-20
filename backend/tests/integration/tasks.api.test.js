const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { bootstrap } = require("../../src/server");

function createTestApp() {
  return bootstrap({}).app;
}

test("GET /api/health responde con estado ok", async () => {
  const response = await request(createTestApp()).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("GET /api/tasks devuelve las tareas semilla", async () => {
  const response = await request(createTestApp()).get("/api/tasks");

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 2);
  assert.equal(response.body[0].title, "Analizar el proyecto base");
});

test("POST /api/tasks crea una tarea válida", async () => {
  const response = await request(createTestApp())
    .post("/api/tasks")
    .send({ title: "  Nueva tarea  ", description: "Descripción" });

  assert.equal(response.status, 201);
  assert.equal(response.body.id, 3);
  assert.equal(response.body.title, "Nueva tarea");
  assert.equal(response.body.description, "Descripción");
  assert.equal(response.body.status, "pendiente");
});

test("POST /api/tasks acepta una descripción nula", async () => {
  const response = await request(createTestApp())
    .post("/api/tasks")
    .send({ title: "Tarea con descripción nula", description: null });

  assert.equal(response.status, 201);
  assert.equal(response.body.description, "");
});

test("POST /api/tasks rechaza títulos inválidos", async () => {
  const response = await request(createTestApp())
    .post("/api/tasks")
    .send({ title: "ab" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "El título debe tener al menos 3 caracteres.");
});

test("PATCH /api/tasks/:id/status actualiza el estado", async () => {
  const response = await request(createTestApp())
    .patch("/api/tasks/1/status")
    .send({ status: "finalizada" });

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
  assert.equal(response.body.status, "finalizada");
});

test("PATCH /api/tasks/:id/status rechaza estados inválidos", async () => {
  const response = await request(createTestApp())
    .patch("/api/tasks/1/status")
    .send({ status: "archivada" });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /Estado inválido/);
});

test("PATCH /api/tasks/:id/status devuelve 404 para IDs inexistentes", async () => {
  const response = await request(createTestApp())
    .patch("/api/tasks/99/status")
    .send({ status: "finalizada" });

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "No existe una tarea con ese identificador.");
});

test("GET /api/tasks/statuses devuelve los estados oficiales", async () => {
  const response = await request(createTestApp()).get("/api/tasks/statuses");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    statuses: ["pendiente", "en progreso", "finalizada"]
  });
});

test("las rutas inexistentes responden 404 en JSON", async () => {
  const response = await request(createTestApp()).get("/api/no-existe");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Ruta no encontrada." });
});

test("un JSON mal formado responde 400 en JSON", async () => {
  const response = await request(createTestApp())
    .post("/api/tasks")
    .set("Content-Type", "application/json")
    .send("{");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "El cuerpo de la petición no es un JSON válido."
  });
});
