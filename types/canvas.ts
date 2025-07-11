export interface Canvas {
  id: string;
  pageId: string;
  name: string;
  order: number;
  width: number;
  height: number;
  unit: SizeUnit;
  createdAt: Date;
  updatedAt: Date;
}

export type SizeUnit = "px" | "mm" | "cm" | "in" | "pt";

export interface CanvasCreateRequest {
  pageId: string;
  name: string;
  width: number;
  height: number;
  unit: SizeUnit;
  order?: number;
}

export interface CanvasUpdateRequest {
  name?: string;
  width?: number;
  height?: number;
  unit?: SizeUnit;
  order?: number;
}
