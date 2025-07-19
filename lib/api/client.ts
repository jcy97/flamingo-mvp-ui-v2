import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

const config: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  timeout: 10000,
};

const createApiClient = (): AxiosInstance => {
  const client = axios.create(config);

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("flamingo-access-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await refreshToken();
          const newToken = localStorage.getItem("flamingo-access-token");
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          clearAuthData();
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

const clearAuthData = (): void => {
  localStorage.removeItem("flamingo-auth");
  localStorage.removeItem("flamingo-access-token");
  sessionStorage.removeItem("flamingo-auth");
};

const refreshToken = async (): Promise<void> => {
  const authData =
    localStorage.getItem("flamingo-auth") ||
    sessionStorage.getItem("flamingo-auth");

  if (!authData) {
    throw new Error("No auth data found");
  }

  const { refreshToken } = JSON.parse(authData);

  const response = await axios.post(`${config.baseURL}/api/v1/auth/refresh`, {
    refresh_token: refreshToken,
  });

  const { access_token, refreshToken: newRefreshToken } = response.data;

  localStorage.setItem("flamingo-access-token", access_token);

  const updatedAuthData = {
    ...JSON.parse(authData),
    accessToken: access_token,
    refreshToken: newRefreshToken,
  };

  if (localStorage.getItem("flamingo-auth")) {
    localStorage.setItem("flamingo-auth", JSON.stringify(updatedAuthData));
  } else {
    sessionStorage.setItem("flamingo-auth", JSON.stringify(updatedAuthData));
  }
};

class ApiClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const api = new ApiClient(apiClient);
export { type ApiResponse, type ApiError };
