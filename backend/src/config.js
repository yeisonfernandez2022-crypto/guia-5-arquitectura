const path = require("node:path");

const DEFAULT_STATIC_DIR = path.resolve(__dirname, "..", "..", "frontend");

function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3000,
    corsOrigin: env.CORS_ORIGIN || "*",
    staticDir: env.STATIC_DIR ? path.resolve(env.STATIC_DIR) : DEFAULT_STATIC_DIR
  };
}

module.exports = { loadConfig };
