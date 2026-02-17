import { useQuery } from "@tanstack/react-query";
import { getClients, getSurfaces, getVannes, getPlantes } from "@/services/data-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Grid3X3, Droplets, Leaf } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(145,63%,32%)", "hsl(145,63%,50%)", "hsl(140,30%,70%)", "hsl(0,84%,60%)"];

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: surfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: vannes = [] } = useQuery({ queryKey: ["vannes"], queryFn: getVannes });
  const { data: plantes = [] } = useQuery({ queryKey: ["plantes"], queryFn: getPlantes });

  const subData = [
    { name: t("sub.op1"), value: clients.filter(c => c.typeAbo === "op1").length },
    { name: t("sub.op1_op2"), value: clients.filter(c => c.typeAbo === "op1_op2").length },
    { name: t("sub.full"), value: clients.filter(c => c.typeAbo === "full").length },
    { name: t("sub.noSub"), value: clients.filter(c => !c.typeAbo).length },
  ].filter(d => d.value > 0);

  const surfPerUser = clients.map(c => ({
    name: `${c.firstName} ${c.lastName?.charAt(0) ?? ""}`,
    surfaces: surfaces.filter(s => s.fkClient === c.id).length,
  }));

  const stats = [
    { label: t("dashboard.totalUsers"), value: clients.length, icon: Users },
    { label: t("dashboard.totalSurfaces"), value: surfaces.length, icon: Grid3X3 },
    { label: t("dashboard.totalVannes"), value: vannes.length, icon: Droplets },
    { label: t("dashboard.totalPlantes"), value: plantes.length, icon: Leaf },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("dashboard.subscriptionDistribution")}</CardTitle></CardHeader>
          <CardContent>
            {subData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={subData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {subData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
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
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={surfPerUser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="surfaces" fill="hsl(145,63%,32%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">—</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
