export interface Page {
  id: string;
  projectId: string;
  name: string;
  order: number;
  width: number;
  height: number;
  dpi: number;
  backgroundColor: string;
  canvases: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  isPublished: boolean;
  thumbnailUrl?: string;
  metadata: PageMetadata;
}

export interface PageMetadata {
  description?: string;
  tags: string[];
  readingDirection: "ltr" | "rtl" | "ttb";
  panelLayout: "free" | "grid" | "vertical";
  exportSettings: ExportSettings;
}

export interface ExportSettings {
  format: "jpg" | "png" | "webp";
  quality: number;
  includeBleed: boolean;
  resolution: number;
}

export interface PageCreateRequest {
  projectId: string;
  name: string;
  width?: number;
  height?: number;
  dpi?: number;
  backgroundColor?: string;
  order?: number;
}

export interface PageUpdateRequest {
  name?: string;
  backgroundColor?: string;
  order?: number;
  metadata?: Partial<PageMetadata>;
}
