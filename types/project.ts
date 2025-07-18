export interface Project {
  id: string;
  name: string;
  owner_id: string;
  deleted_at?: Date;
  thumbnail?: string;
  description?: string;
  updatedAt?: Date;
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
  deleted_at: Date;
  affected_users: number;
}
