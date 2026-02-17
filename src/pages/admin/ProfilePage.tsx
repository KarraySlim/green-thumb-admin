import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : user?.email ?? "";

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${(profile.last_name?.[0] ?? "")}`.toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t("nav.profile")}</h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: User, label: t("auth.firstName"), value: profile?.first_name ?? "—" },
              { icon: User, label: t("auth.lastName"), value: profile?.last_name ?? "—" },
              { icon: Mail, label: t("auth.email"), value: user?.email ?? "—" },
              { icon: Calendar, label: t("profile.memberSince"), value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
