export interface Project {
  id: string;
  name: string;
  owner_id: string;
  deleted_at?: string | null;
  thumbnail?: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ProjectCollaborator {
  project_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
}

export interface ProjectDeletionLog {
  id: number;
  project_id: string;
  deleted_by: string;
  deleted_at: string;
  affected_users: number;
}
