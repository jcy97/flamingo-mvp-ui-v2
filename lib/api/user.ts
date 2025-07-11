import { api } from "./client";
import { User } from "@/types/auth";

interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  user_type?: string;
}

export const userApi = {
  getUsers: async (
    params: UserSearchParams = {}
  ): Promise<UserListResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return api.get(`/api/v1/users?${queryParams.toString()}`);
  },

  getUserById: async (userId: string): Promise<{ user: User }> => {
    return api.get(`/api/v1/users/${userId}`);
  },

  updateUser: async (
    userId: string,
    data: UpdateUserRequest
  ): Promise<{ user: User }> => {
    return api.put(`/api/v1/users/${userId}`, data);
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    return api.delete(`/api/v1/users/${userId}`);
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    return api.post("/api/v1/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  followUser: async (userId: string): Promise<{ message: string }> => {
    return api.post(`/api/v1/users/${userId}/follow`);
  },

  unfollowUser: async (userId: string): Promise<{ message: string }> => {
    return api.delete(`/api/v1/users/${userId}/follow`);
  },

  getFollowers: async (userId: string): Promise<{ followers: User[] }> => {
    return api.get(`/api/v1/users/${userId}/followers`);
  },

  getFollowing: async (userId: string): Promise<{ following: User[] }> => {
    return api.get(`/api/v1/users/${userId}/following`);
  },

  blockUser: async (userId: string): Promise<{ message: string }> => {
    return api.post(`/api/v1/users/${userId}/block`);
  },

  unblockUser: async (userId: string): Promise<{ message: string }> => {
    return api.delete(`/api/v1/users/${userId}/block`);
  },

  getBlockedUsers: async (): Promise<{ blocked_users: User[] }> => {
    return api.get("/api/v1/users/blocked");
  },
};
