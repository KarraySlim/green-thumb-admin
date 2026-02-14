import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Droplets, Leaf, Grid3X3, Workflow, Users, Mountain, CloudSun, FileStack } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Surfaces", url: "/admin/surfaces", icon: Grid3X3 },
  { title: "Plantes", url: "/admin/plantes", icon: Leaf },
  { title: "Vannes", url: "/admin/vannes", icon: Droplets },
  { title: "Types de plante", url: "/admin/types-plante", icon: Workflow },
  { title: "Sols", url: "/admin/sols", icon: Mountain },
  { title: "Climats", url: "/admin/climats", icon: CloudSun },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Nouveau projet", url: "/admin/wizard", icon: FileStack },
];

const pageTitles: Record<string, string> = {
  "/admin/surfaces": "Surfaces",
  "/admin/plantes": "Plantes",
  "/admin/vannes": "Vannes",
  "/admin/types-plante": "Types de plante",
  "/admin/sols": "Sols",
  "/admin/climats": "Climats",
  "/admin/clients": "Clients",
  "/admin/wizard": "Nouveau projet d'irrigation",
};

export default function AdminLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Administration";

  if (location.pathname === "/admin" || location.pathname === "/admin/") {
    return <Navigate to="/admin/surfaces" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">Irrigation Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
