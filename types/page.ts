export interface Page {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageCreateRequest {
  projectId: string;
  name: string;
  order?: number;
}

export interface PageUpdateRequest {
  name?: string;
  order?: number;
}
