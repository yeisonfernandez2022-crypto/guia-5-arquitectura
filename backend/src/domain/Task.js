const { ValidationError } = require("./errors");
const { DEFAULT_STATUS, assertValidStatus } = require("./TaskStatus");

class Task {
  constructor({ id, title, description, status, createdAt, updatedAt }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(input = {}) {
    const now = new Date().toISOString();
    return new Task({
      id: null,
      title: normalizeTitle(input.title),
      description: normalizeDescription(input.description),
      status: DEFAULT_STATUS,
      createdAt: now,
      updatedAt: now
    });
  }

  static fromPersistence(data = {}) {
    const now = new Date().toISOString();
    const status = data.status ?? DEFAULT_STATUS;
    assertValidStatus(status);

    return new Task({
      id: data.id ?? null,
      title: normalizeTitle(data.title),
      description: normalizeDescription(data.description),
      status,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now
    });
  }

  changeStatus(status) {
    assertValidStatus(status);
    this.status = status;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  clone() {
    return Task.fromPersistence(this.toObject());
  }

  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

function normalizeTitle(title) {
  const normalized = typeof title === "string" ? title.trim() : "";
  if (normalized.length < 3) {
    throw new ValidationError("El título debe tener al menos 3 caracteres.");
  }
  return normalized;
}

function normalizeDescription(description) {
  if (description === undefined || description === null) return "";
  return String(description).trim();
}

module.exports = { Task };
