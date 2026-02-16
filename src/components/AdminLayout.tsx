import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Droplets, Leaf, Grid3X3, Workflow, Users, Mountain, CloudSun, FileStack, Briefcase, LogOut, CreditCard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logoTesla from "@/assets/logo-tesla-energie.png";
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
  { titleKey: "nav.travail", url: "/admin/travail", icon: Briefcase },
  { titleKey: "nav.surfaces", url: "/admin/surfaces", icon: Grid3X3 },
  { titleKey: "nav.plantes", url: "/admin/plantes", icon: Leaf },
  { titleKey: "nav.vannes", url: "/admin/vannes", icon: Droplets },
  { titleKey: "nav.typesPlante", url: "/admin/types-plante", icon: Workflow },
  { titleKey: "nav.sols", url: "/admin/sols", icon: Mountain },
  { titleKey: "nav.climats", url: "/admin/climats", icon: CloudSun },
  { titleKey: "nav.clients", url: "/admin/clients", icon: Users },
  { titleKey: "nav.subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { titleKey: "nav.wizard", url: "/admin/wizard", icon: FileStack },
];

const pageTitleKeys: Record<string, string> = {
  "/admin/travail": "nav.travail",
  "/admin/surfaces": "nav.surfaces",
  "/admin/plantes": "nav.plantes",
  "/admin/vannes": "nav.vannes",
  "/admin/types-plante": "nav.typesPlante",
  "/admin/sols": "nav.sols",
  "/admin/climats": "nav.climats",
  "/admin/clients": "nav.clients",
  "/admin/wizard": "nav.wizard",
  "/admin/subscriptions": "nav.subscriptions",
};

export default function AdminLayout() {
  const location = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const titleKey = pageTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey) : "Administration";

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
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoTesla} alt="Tesla Energie" className="h-10 w-10 object-contain" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-sidebar-foreground tracking-wide">TESLA</span>
                <span className="text-[10px] font-semibold tracking-[0.25em] text-primary">ENERGIE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t("nav.navigation")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{t(item.titleKey)}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground flex-1">{title}</h1>
            <LanguageSwitcher />
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
