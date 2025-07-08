import { api } from "./client";
import {
  LoginRequest,
  LoginSuccessResponse,
  RegisterRequest,
  RegisterResponse,
  CheckEmailResponse,
} from "@/types/auth";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginSuccessResponse> => {
    return api.post("/api/v1/auth/login", data);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post("/api/v1/auth/register", data);
  },

  checkEmail: async (email: string): Promise<CheckEmailResponse> => {
    return api.get(
      `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`
    );
  },

  logout: async (): Promise<void> => {
    const authData =
      localStorage.getItem("flamingo-auth") ||
      sessionStorage.getItem("flamingo-auth");

    if (authData) {
      const { refreshToken } = JSON.parse(authData);
      await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
    }

    localStorage.removeItem("flamingo-auth");
    localStorage.removeItem("flamingo-access-token");
    sessionStorage.removeItem("flamingo-auth");
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> => {
    return api.post("/api/v1/auth/refresh", { refresh_token: refreshToken });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/forgot-password", { email });
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/reset-password", { token, password });
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/verify-email", { token });
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/resend-verification", { email });
  },

  getProfile: async (): Promise<{ user: any }> => {
    return api.get("/api/v1/auth/profile");
  },

  updateProfile: async (
    data: Partial<RegisterRequest>
  ): Promise<{ user: any }> => {
    return api.put("/api/v1/auth/profile", data);
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return api.put("/api/v1/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  deleteAccount: async (password: string): Promise<{ message: string }> => {
    return api.delete("/api/v1/auth/account", { data: { password } });
  },
};
