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
    label: "Dashboard",
    href: "/project/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "invoices",
    label: "Invoices",
    href: "/project/invoices",
    icon: FileText,
    badge: 2,
  },
  {
    id: "clients",
    label: "Clients",
    href: "/project/clients",
    icon: Users,
  },
  {
    id: "products",
    label: "Products",
    href: "/project/products",
    icon: Package,
    badge: 2,
  },
  {
    id: "messages",
    label: "Messages",
    href: "/project/messages",
    icon: MessageSquare,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/project/settings",
    icon: Settings,
  },
  {
    id: "help",
    label: "Help",
    href: "/project/help",
    icon: HelpCircle,
  },
];
