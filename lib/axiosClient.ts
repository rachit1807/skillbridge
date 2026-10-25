import axios from "axios";
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export const axiosClient = axios.create({
  baseURL: "/api/",
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
axiosClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !String(error.config?.url).startsWith("auth/")
    ) {
      setAccessToken(null);
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(
      new Error(
        error.response?.data?.error || "Connection failed. Please try again.",
      ),
    );
  },
);
export async function api(path: string, method = "GET", body?: unknown) {
  return (await axiosClient.request({ url: path, method, data: body })).data;
}
