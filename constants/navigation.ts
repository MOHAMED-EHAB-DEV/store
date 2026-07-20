
export const NavigationLinks = [
  { id: 0, text: "Home", link: "/" },
  { id: 1, text: "Templates", link: "/templates" },
  { id: 2, text: "Blog", link: "/blog" },
  { id: 3, text: "Pricing", link: "/pricing" },
  { id: 4, text: "Support", link: "/support" },
] as const;

export const FooterLinks = [
  { id: 0, text: "Home", link: "/" },
  { id: 1, text: "Templates", link: "/templates" },
  { id: 2, text: "Blog", link: "/blog" },
  { id: 3, text: "Pricing", link: "/pricing" },
  { id: 4, text: "FAQs", link: "/faqs" },
  { id: 5, text: "Support", link: "/support" },
  { id: 6, text: "Custom Development", link: "/custom-development" },
] as const;

import { LayoutDashboard as LayoutDashboardIcon } from "@/components/ui/svgs/icons/LayoutDashboard";
import { Templates as TemplatesIcon } from "@/components/ui/svgs/icons/Templates";
import { Headset as HeadsetIcon } from "@/components/ui/svgs/icons/Headset";
import { Settings as SettingsIcon } from "@/components/ui/svgs/icons/Settings";
import { Users as UsersIcon } from "@/components/ui/svgs/icons/Users";
import { FolderOpen as FolderOpenIcon } from "@/components/ui/svgs/icons/FolderOpen";
import { Blocks as BlocksIcon } from "@/components/ui/svgs/icons/Blocks";
import { HelpCircle as HelpCircleIcon } from "@/components/ui/svgs/icons/HelpCircle";
import { Download as DownloadIcon } from "@/components/ui/svgs/icons/Download";
import { AlertCircle as AlertCircleIcon } from "@/components/ui/svgs/icons/AlertCircle";
import { Analytics as AnalyticsIcon } from "@/components/ui/svgs/icons/Analytics";
import { Zap as ZapIcon } from "@/components/ui/svgs/icons/Zap";

export const DashboardSidebarLinks = [
  { Icon: LayoutDashboardIcon, text: "Dashboard", link: "/dashboard" },
  { Icon: TemplatesIcon, text: "Purchased Templates", link: "/dashboard/purchased-templates" },
  { Icon: HeadsetIcon, text: "Support", link: "/dashboard/support" },
  { Icon: SettingsIcon, text: "Settings", link: "/dashboard/settings" },
] as const;

export const AdminSidebarLinks = [
  { Icon: LayoutDashboardIcon, text: "Dashboard", link: "/admin" },
  { Icon: UsersIcon, text: "Users", link: "/admin/users" },
  { Icon: TemplatesIcon, text: "Templates", link: "/admin/templates" },
  { Icon: FolderOpenIcon, text: "Categories", link: "/admin/categories" },
  { Icon: BlocksIcon, text: "Blog", link: "/admin/blogs" },
  { Icon: HelpCircleIcon, text: "FAQs", link: "/admin/faqs" },
  { Icon: DownloadIcon, text: "Downloads", link: "/admin/download-logs" },
  { Icon: AlertCircleIcon, text: "Error Logs", link: "/admin/error-logs" },
  { Icon: AnalyticsIcon, text: "Analytics", link: "/admin/analytics" },
  { Icon: HeadsetIcon, text: "Support", link: "/admin/support" },
  { Icon: ZapIcon, text: "Performance", link: "/admin/performance" },
] as const;
