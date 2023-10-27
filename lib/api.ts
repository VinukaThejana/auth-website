import axios from "axios";

const baseURL = "http://localhost:8080"

export const checkApi = axios.create({
  baseURL: `${baseURL}/check`,
})
checkApi.defaults.headers.common["Content-Type"] = "application/json";

export const authApi = axios.create({
  baseURL: `${baseURL}/auth`
})
authApi.defaults.headers.common["Content-Type"] = "application/json";
