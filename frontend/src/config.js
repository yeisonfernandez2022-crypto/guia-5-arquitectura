const currentWindow = typeof window === "undefined" ? null : window;
const isFileProtocol = currentWindow?.location.protocol === "file:";
const defaultApiUrl = isFileProtocol ? "http://localhost:3000/api" : "/api";

export const API_URL = currentWindow?.__TASK_API_URL__ || defaultApiUrl;
