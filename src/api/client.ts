import axios from "axios";
import { authService } from "../services/authService";
import { API_BASE_URL } from "../config/api";

function getAppPath(pathname: string): string {
  const basePath = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${basePath}${pathname.replace(/^\/+/, "")}`;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiOptional = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = authService.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiOptional.interceptors.request.use((config) => {
  const accessToken = authService.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authService.logout();
      authService.setPostLoginNotice("Sessão expirada. Faça login novamente.");

      const loginPath = getAppPath("login");

      if (window.location.pathname !== loginPath) {
        window.location.replace(loginPath);
      }
    }

    return Promise.reject(error);
  },
);