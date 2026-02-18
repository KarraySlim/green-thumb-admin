import { useQuery } from "@tanstack/react-query";
import { getClients, getSurfaces } from "@/services/data-service";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Grid3X3, AlertTriangle, CheckCircle, Bell, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["hsl(145,63%,32%)", "hsl(145,63%,50%)", "hsl(140,30%,70%)", "hsl(0,84%,60%)"];

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: surfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: notifications = [] } = useQuery({
    queryKey: ["subscription_notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("subscription_notifications").select("*").order("sent_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  // Subscription distribution
  const subData = [
    { name: t("sub.op1"), value: clients.filter(c => c.typeAbo === "op1").length },
    { name: t("sub.op1_op2"), value: clients.filter(c => c.typeAbo === "op1_op2").length },
    { name: t("sub.full"), value: clients.filter(c => c.typeAbo === "full").length },
    { name: t("sub.noSub"), value: clients.filter(c => !c.typeAbo).length },
  ].filter(d => d.value > 0);

  // Surfaces per user
  const surfPerUser = clients.map(c => ({
    name: `${c.firstName} ${c.lastName?.charAt(0) ?? ""}`,
    surfaces: surfaces.filter(s => s.fkClient === c.id).length,
  }));

  // Subscription alerts
  const now = Date.now();
  const expiringSoon = clients.filter(c => {
    if (!c.dateExpAbo) return false;
    const diff = Math.ceil((new Date(c.dateExpAbo).getTime() - now) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 30;
  });
  const expired = clients.filter(c => {
    if (!c.dateExpAbo) return false;
    return new Date(c.dateExpAbo).getTime() <= now;
  });
  const activeCount = clients.filter(c => {
    if (!c.dateExpAbo) return false;
    return new Date(c.dateExpAbo).getTime() > now;
  }).length;

  const stats = [
    { label: t("dashboard.totalUsers"), value: clients.length, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: t("dashboard.totalSurfaces"), value: surfaces.length, icon: Grid3X3, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("dashboard.activeSubscriptions"), value: activeCount, icon: ShieldCheck, color: "bg-green-500/10 text-green-600" },
    { label: t("dashboard.notificationsSent"), value: notifications.length, icon: Bell, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold text-foreground">{activeCount}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.activeSubscriptions")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-lg font-bold text-foreground">{expiringSoon.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.expiringSoon")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-lg font-bold text-foreground">{expired.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.expiredSubs")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("dashboard.subscriptionDistribution")}</CardTitle></CardHeader>
          <CardContent>
            {subData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={subData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`} paddingAngle={3}>
                    {subData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">—</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("dashboard.surfacesPerUser")}</CardTitle></CardHeader>
          <CardContent>
            {surfPerUser.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={surfPerUser}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="surfaces" fill="hsl(145,63%,32%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring soon table */}
      {expiringSoon.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> {t("dashboard.expiringClients")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map(c => {
                const days = Math.ceil((new Date(c.dateExpAbo!).getTime() - now) / (1000 * 60 * 60 * 24));
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Badge variant={days <= 7 ? "destructive" : "outline"} className="text-xs">
                      {days} {t("sub.daysLeft")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
