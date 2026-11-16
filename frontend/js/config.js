/**
 * config.js
 * Centralized configuration for the frontend.
 * Change API_BASE_URL if your backend runs on a different host/port.
 */
const API_BASE_URL = "http://127.0.0.1:8000";

const CONFIG = { API_BASE_URL };
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}