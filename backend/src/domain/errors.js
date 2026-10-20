class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends DomainError {}

class NotFoundError extends DomainError {}

module.exports = { DomainError, ValidationError, NotFoundError };
