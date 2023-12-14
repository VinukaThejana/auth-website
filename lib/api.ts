import axios, { InternalAxiosRequestConfig } from "axios";
import { deleteCookie, getCookie } from "./utils";

const baseURL = "http://localhost:8080";

axios.defaults.headers.common["Content-Type"] = "application/json";

export const checkAccessToken = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  const accessToken = getCookie("access_token");
  if (!accessToken) {
    try {
      await axios.post(`${baseURL}/auth/refresh`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      deleteCookie("session");
      window.location.href = "/";
      throw error;
    }
  }

  return config;
};

export const authApi = axios.create({
  baseURL: `${baseURL}/auth`,
  withCredentials: true,
});

export const oauthApi = axios.create({
  baseURL: `${baseURL}/oauth`,
  withCredentials: true,
})

export const checkApi = axios.create({
  baseURL: `${baseURL}/check`,
});

export const userApi = axios.create({
  baseURL: `${baseURL}/user`,
  withCredentials: true,
});
