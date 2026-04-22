import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfiles, getSurfaces, getVannes } from "@/services/data-service";
import { useFilteredProfiles } from "@/hooks/useRoleFilter";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Grid3X3, AlertTriangle, ShieldCheck, Crown, Trophy, Star, Wifi, CalendarDays } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["hsl(145,63%,32%)", "hsl(145,63%,50%)", "hsl(140,30%,70%)", "hsl(0,84%,60%)"];
const COLORS2 = ["hsl(210,80%,55%)", "hsl(30,90%,55%)", "hsl(145,63%,40%)", "hsl(280,60%,55%)"];

type Range = "day" | "week" | "month" | "year" | "all";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [range, setRange] = useState<Range>("month");
  const qc = useQueryClient();

  // Realtime sync — invalidate KPIs instantly on any data change
  useEffect(() => {
    const ch = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => qc.invalidateQueries({ queryKey: ["profiles"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "surfaces" }, () => qc.invalidateQueries({ queryKey: ["surfaces"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "vannes" }, () => qc.invalidateQueries({ queryKey: ["vannes"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const { data: allProfiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: getProfiles });
  const allFiltered = useFilteredProfiles(allProfiles);
  const profiles = allFiltered.filter(p => p.user_role === "CLIENT");
  const { data: allSurfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: vannes = [] } = useQuery({ queryKey: ["vannes"], queryFn: getVannes });

  const visibleIds = useMemo(() => new Set(allFiltered.map(p => p.id)), [allFiltered]);
  const surfaces = useMemo(() => allSurfaces.filter(s => !s.fkUser || visibleIds.has(s.fkUser)), [allSurfaces, visibleIds]);

  // Date filter cutoff
  const cutoff = useMemo(() => {
    const d = new Date();
    if (range === "day") d.setDate(d.getDate() - 1);
    else if (range === "week") d.setDate(d.getDate() - 7);
    else if (range === "month") d.setMonth(d.getMonth() - 1);
    else if (range === "year") d.setFullYear(d.getFullYear() - 1);
    else return null;
    return d.getTime();
  }, [range]);

  const now = Date.now();
  const subscribed = profiles.filter(c => c.date_exp_abo && new Date(c.date_exp_abo).getTime() > now);

  // Best subscription formula = combination most chosen
  const formulaCount: Record<string, number> = {};
  subscribed.forEach(p => {
    const opts = ["CapteurSol"];
    if (p.abo_electrovanne) opts.push("ElectroVanne");
    if (p.abo_sante_plante) opts.push("SantéPlante");
    const key = opts.join(" + ");
    formulaCount[key] = (formulaCount[key] ?? 0) + 1;
  });
  const bestFormula = Object.entries(formulaCount).sort((a, b) => b[1] - a[1])[0];

  // Best user = most parcelles
  const userParcelles = profiles.map(p => ({
    profile: p,
    count: surfaces.filter(s => s.fkUser === p.id).length,
  })).sort((a, b) => b.count - a.count);
  const bestUser = userParcelles[0];

  // Sous-admins clients
  const sousAdmins = allFiltered.filter(p => p.user_role === "SOUS_ADMIN");
  const sousAdminClients = sousAdmins.map(sa => ({
    name: `${sa.first_name} ${sa.last_name}`.trim() || sa.email || "—",
    clients: allProfiles.filter(p => p.created_by === sa.id).length,
  }));

  // Connected parcelles count
  const connectedSurfaces = surfaces.filter(s => s.isConnected).length;

  // Subscription distribution
  const subData = [
    { name: "CapteurSol seul", value: subscribed.filter(p => !p.abo_electrovanne && !p.abo_sante_plante).length },
    { name: "+ ElectroVanne", value: subscribed.filter(p => p.abo_electrovanne && !p.abo_sante_plante).length },
    { name: "+ SantéPlante", value: subscribed.filter(p => !p.abo_electrovanne && p.abo_sante_plante).length },
    { name: "Full Options", value: subscribed.filter(p => p.abo_electrovanne && p.abo_sante_plante).length },
  ].filter(d => d.value > 0);

  const surfPerUser = profiles.slice(0, 8).map(c => ({
    name: `${c.first_name} ${c.last_name?.charAt(0) ?? ""}`,
    surfaces: surfaces.filter(s => s.fkUser === c.id).length,
  })).filter(d => d.surfaces > 0);

  const expiringSoon = profiles.filter(c => {
    if (!c.date_exp_abo) return false;
    const diff = Math.ceil((new Date(c.date_exp_abo).getTime() - now) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 30;
  });

  const stats = [
    { label: "Total utilisateurs", value: allFiltered.length, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "Utilisateurs abonnés", value: subscribed.length, icon: ShieldCheck, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Parcelles", value: surfaces.length, icon: Grid3X3, color: "bg-amber-500/10 text-amber-600" },
    { label: "Parcelles connectées", value: connectedSurfaces, icon: Wifi, color: "bg-green-500/10 text-green-600" },
    { label: "Sous-Admins", value: sousAdmins.length, icon: Crown, color: "bg-violet-500/10 text-violet-600" },
  ];

  const ranges: { v: Range; label: string }[] = [
    { v: "day", label: "Jour" },
    { v: "week", label: "Semaine" },
    { v: "month", label: "Mois" },
    { v: "year", label: "Année" },
    { v: "all", label: "Tout" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {ranges.map(r => (
            <Button
              key={r.v}
              size="sm"
              variant={range === r.v ? "default" : "ghost"}
              onClick={() => setRange(r.v)}
              className="h-7 text-xs"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold text-foreground leading-tight truncate">{s.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate" title={s.label}>{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Meilleure formule</p>
              <p className="text-lg font-bold text-foreground">{bestFormula?.[0] ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{bestFormula?.[1] ?? 0} abonné(s)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Meilleur utilisateur</p>
              <p className="text-lg font-bold text-foreground">
                {bestUser?.profile.first_name} {bestUser?.profile.last_name} {!bestUser?.count && "—"}
              </p>
              <p className="text-xs text-muted-foreground">{bestUser?.count ?? 0} parcelle(s)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Répartition des abonnements</CardTitle></CardHeader>
          <CardContent>
            {subData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={subData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`} paddingAngle={3}>
                    {subData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">Aucun abonnement actif</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Clients par Sous-Admin</CardTitle></CardHeader>
          <CardContent>
            {sousAdminClients.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sousAdminClients}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="clients" fill="hsl(280,60%,55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">Aucun sous-admin</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Parcelles par utilisateur (top 8)</CardTitle></CardHeader>
          <CardContent>
            {surfPerUser.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={surfPerUser}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="surfaces" name="Parcelles" fill="hsl(145,63%,32%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">—</p>}
          </CardContent>
        </Card>
      </div>

      {expiringSoon.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Clients avec abonnement expirant bientôt</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map(c => {
                const days = Math.ceil((new Date(c.date_exp_abo!).getTime() - now) / (1000 * 60 * 60 * 24));
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Badge variant="outline" className="border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/30">
                      {days} j restants
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
