import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";

export interface ProjectMenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

export const projectMenuItems: ProjectMenuItem[] = [
  {
    id: "dashboard",
    label: "대시보드",
    href: "/project/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "messages",
    label: "알림",
    href: "/project/messages",
    icon: MessageSquare,
  },
  {
    id: "settings",
    label: "설정",
    href: "/project/settings",
    icon: Settings,
  },
  {
    id: "help",
    label: "도움말",
    href: "/project/help",
    icon: HelpCircle,
  },
];
