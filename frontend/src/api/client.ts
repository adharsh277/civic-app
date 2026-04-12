import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseURL = envBaseUrl || (import.meta.env.DEV ? "/api" : "http://localhost:5000");

export const api = axios.create({
  baseURL,
  timeout: 10000,
});
