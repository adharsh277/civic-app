import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

export const api = axios.create({
  baseURL: API,
  timeout: 10000,
});
