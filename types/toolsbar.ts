import { LucideIcon } from "lucide-react";
export interface SubToolsbarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ToolsbarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hasSubItems?: boolean;
  subItems?: SubToolsbarItem[];
}
