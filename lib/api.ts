import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { browser } from "process";
import { toast } from "sonner";
import { Errs } from "~/types/errors";
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
      const err = error as AxiosError<{
        status: Errs;
      }>;
      switch (err.response?.data.status) {
        case "refresh_token_expired":
          toast.error("Unauthorized");
          break;
        default:
          toast.error("Something went wrong");
      }

      deleteCookie("session");
      window.location.href = "/";
      throw AxiosError;
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

export const userApi = axios.create({
  baseURL: `${baseURL}/user`,
});
