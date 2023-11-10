import axios, { InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { getCookie } from "./utils";

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
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return config;
};

export const authApi = axios.create({
  baseURL: `${baseURL}/auth`,
  withCredentials: true,
});

export const checkApi = axios.create({
  baseURL: `${baseURL}/check`,
});
