import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { TasksView } from "../src/views/tasksView.js";

function createView() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <span id="api-status"></span>
        <form id="task-form">
          <input id="title">
          <textarea id="description"></textarea>
          <p id="message"></p>
        </form>
        <button id="refresh" type="button">Actualizar</button>
        <div id="task-list"></div>
      </body>
    </html>
  `);

  return { dom, view: new TasksView(dom.window.document) };
}

const statuses = ["pendiente", "en progreso", "finalizada"];

test("renderTasks crea las tarjetas y selecciona el estado actual", () => {
  const { dom, view } = createView();

  view.renderTasks(
    [
      { id: 1, title: "Primera tarea", description: "Detalle", status: "en progreso" },
      { id: 2, title: "Segunda tarea", description: "", status: "pendiente" }
    ],
    statuses
  );

  const articles = dom.window.document.querySelectorAll(".task");
  assert.equal(articles.length, 2);
  assert.equal(articles[0].querySelector("h3").textContent, "Primera tarea");
  assert.equal(articles[1].querySelector("p").textContent, "Sin descripción");

  const selected = articles[0].querySelector("select").selectedOptions[0];
  assert.equal(selected.value, "en progreso");
});

test("renderTasks escapa contenido peligroso usando textContent", () => {
  const { dom, view } = createView();
  const dangerousTitle = '<img src=x onerror="window.hacked = true">';

  view.renderTasks(
    [{ id: 1, title: dangerousTitle, description: "", status: "pendiente" }],
    statuses
  );

  assert.equal(dom.window.document.querySelector(".task h3").textContent, dangerousTitle);
  assert.equal(dom.window.document.querySelector(".task img"), null);
});

test("renderTasks muestra un mensaje cuando no hay tareas", () => {
  const { dom, view } = createView();

  view.renderTasks([], statuses);

  assert.equal(
    dom.window.document.querySelector("#task-list").textContent,
    "No hay tareas todavía. Crea la primera."
  );
});

test("bind conecta formulario, actualización y cambio de estado", () => {
  const { dom, view } = createView();
  const calls = { created: null, refreshed: 0, changed: null };

  view.bind({
    onCreate: input => { calls.created = input; },
    onRefresh: () => { calls.refreshed += 1; },
    onChangeStatus: (id, status) => { calls.changed = { id, status }; }
  });

  view.titleInput.value = "Nueva tarea";
  view.descriptionInput.value = "Detalle";
  view.form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
  assert.deepEqual(calls.created, { title: "Nueva tarea", description: "Detalle" });

  view.refreshButton.click();
  assert.equal(calls.refreshed, 1);

  view.renderTasks([{ id: 7, title: "Tarea", description: "", status: "pendiente" }], statuses);
  const select = dom.window.document.querySelector('[data-task-id="7"]');
  select.value = "finalizada";
  dom.window.document.querySelector('[data-save-id="7"]').click();
  assert.deepEqual(calls.changed, { id: "7", status: "finalizada" });
});

test("showMessage y setApiStatus cambian las clases visuales", () => {
  const { view } = createView();

  view.showMessage("Error de prueba", "error");
  assert.equal(view.message.textContent, "Error de prueba");
  assert.equal(view.message.className, "message message--error");

  view.setApiStatus("API no disponible", "error");
  assert.equal(view.apiStatus.textContent, "API no disponible");
  assert.equal(view.apiStatus.className, "status status--error");
});
