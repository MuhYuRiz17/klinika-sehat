import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Calendar, 
  ClipboardList, 
  FileText, 
  BarChart3,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type AppRole = 'admin' | 'dokter' | 'manajemen' | 'pasien';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: AppRole[];
}

const allMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ['admin', 'dokter', 'manajemen'],
  },
  {
    title: "Pasien",
    url: "/pasien",
    icon: Users,
    roles: ['admin', 'dokter', 'manajemen'],
  },
  {
    title: "Kunjungan",
    url: "/kunjungan",
    icon: ClipboardList,
    roles: ['admin', 'dokter'],
  },
  {
    title: "Rekam Medis",
    url: "/rekam-medis",
    icon: FileText,
    roles: ['admin', 'dokter'],
  },
];

const masterItems: MenuItem[] = [
  {
    title: "Dokter",
    url: "/dokter",
    icon: UserCog,
    roles: ['admin', 'manajemen'],
  },
  {
    title: "Jadwal Praktik",
    url: "/jadwal",
    icon: Calendar,
    roles: ['admin', 'dokter', 'manajemen'],
  },
];

const reportItems: MenuItem[] = [
  {
    title: "Laporan Periode",
    url: "/laporan",
    icon: BarChart3,
    roles: ['admin', 'manajemen'],
  },
];

const roleLabels: Record<AppRole, string> = {
  admin: 'Staff Pendaftaran',
  dokter: 'Dokter',
  manajemen: 'Manajemen',
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user, role, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const filterByRole = (items: MenuItem[]) => {
    if (!role) return [];
    return items.filter(item => item.roles.includes(role));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = filterByRole(allMenuItems);
  const filteredMasterItems = filterByRole(masterItems);
  const filteredReportItems = filterByRole(reportItems);

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-sm font-semibold text-sidebar-foreground">
                Klinik Pratama
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Sistem Informasi
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        isActive(item.url)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredMasterItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Master Data
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMasterItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                          isActive(item.url)
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredReportItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Laporan
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredReportItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                          isActive(item.url)
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-xs font-medium text-sidebar-accent-foreground">
              {getUserInitials()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {getUserDisplayName()}
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                {role ? roleLabels[role] : 'Loading...'}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
