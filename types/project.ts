export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  isShared?: boolean;
  collaborators?: string[];
}
