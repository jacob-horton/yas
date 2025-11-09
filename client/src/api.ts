import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api/",
  withCredentials: true,
});

const REFRESH_PATH = "/auth/refresh";

export const setupAxiosInterceptors = (logout: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Propagate error if not an unauthorised response
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // If this is the refresh request - error (causing logout)
      if (error.request.responseURL.endsWith(REFRESH_PATH)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Handle unauthorised - use refresh token
      try {
        await api.post(REFRESH_PATH);

        // Retry request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh request failed
        logout();
        return Promise.reject(refreshError);
      }
    },
  );
};
