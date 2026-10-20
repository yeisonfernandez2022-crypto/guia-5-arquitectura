import { API_URL } from "../config.js";

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(baseUrl, path, options = {}) {
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch (error) {
    throw new ApiError("No se pudo conectar con la API.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || "No se pudo completar la operación.", response.status);
  }

  return data;
}

export function createTaskApi(baseUrl = API_URL) {
  const normalizedBase = baseUrl.replace(/\/$/, "");

  return {
    listTasks() {
      return request(normalizedBase, "/tasks");
    },

    async listStatuses() {
      const data = await request(normalizedBase, "/tasks/statuses");
      return data.statuses ?? [];
    },

    createTask(payload) {
      return request(normalizedBase, "/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    changeStatus(id, status) {
      return request(normalizedBase, `/tasks/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    }
  };
}
