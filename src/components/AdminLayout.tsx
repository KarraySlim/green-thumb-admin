import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Droplets, Leaf, Grid3X3, Workflow, Users, Mountain, CloudSun, FileStack, Briefcase, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Travail", url: "/admin/travail", icon: Briefcase },
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
  "/admin/travail": "Travail",
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
  const { user, profile, loading, signOut } = useAuth();
  const title = pageTitles[location.pathname] ?? "Administration";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Droplets className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (location.pathname === "/admin" || location.pathname === "/admin/") {
    return <Navigate to="/admin/travail" replace />;
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : user.email ?? "";

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${(profile.last_name?.[0] ?? "")}`.toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
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
          <SidebarFooter className="p-4">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </SidebarFooter>
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
