import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});

export const setupAxiosInterceptors = (logout: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Logout if unauthorised
      if (error.response?.status === 401) {
        logout();
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
};
