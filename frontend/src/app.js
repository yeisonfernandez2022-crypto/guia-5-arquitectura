const API_URL = "http://localhost:3000/api/tasks";
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const taskList = document.querySelector("#task-list");
const message = document.querySelector("#message");
const apiStatus = document.querySelector("#api-status");

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

async function request(url = API_URL, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}

function renderTasks(tasks) {
  if (!tasks.length) {
    taskList.innerHTML = "<p>No hay tareas todavía. Crea la primera.</p>";
    return;
  }
  taskList.innerHTML = tasks.map(task => `
    <article class="task">
      <div class="task-top">
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          <p>${escapeHtml(task.description || "Sin descripción")}</p>
        </div>
        <strong>#${task.id}</strong>
      </div>
      <div class="task-actions">
        <label for="status-${task.id}">Estado</label>
        <select id="status-${task.id}" data-task-id="${task.id}">
          ${["pendiente", "en progreso", "finalizada"].map(status =>
            `<option ${task.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        <button type="button" class="secondary" data-save-id="${task.id}">Guardar estado</button>
      </div>
    </article>
  `).join("");
}

async function loadTasks() {
  try {
    const tasks = await request();
    renderTasks(tasks);
    apiStatus.textContent = "API conectada";
  } catch (error) {
    apiStatus.textContent = "API no disponible";
    apiStatus.style.background = "#fde8e8";
    apiStatus.style.color = "#9b2222";
    taskList.innerHTML = `<p>${escapeHtml(error.message)}. Verifica que el backend esté iniciado.</p>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  try {
    await request(API_URL, {
      method: "POST",
      body: JSON.stringify({ title: titleInput.value, description: descriptionInput.value })
    });
    form.reset();
    message.style.color = "#17663a";
    message.textContent = "Tarea creada correctamente.";
    await loadTasks();
  } catch (error) {
    message.style.color = "#a12b2b";
    message.textContent = error.message;
  }
});

document.querySelector("#refresh").addEventListener("click", loadTasks);

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-save-id]");
  if (!button) return;
  const id = button.dataset.saveId;
  const select = taskList.querySelector(`[data-task-id="${id}"]`);
  try {
    await request(`${API_URL}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: select.value })
    });
    await loadTasks();
  } catch (error) {
    message.style.color = "#a12b2b";
    message.textContent = error.message;
  }
});

loadTasks();
