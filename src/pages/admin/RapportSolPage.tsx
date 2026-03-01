
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getClients } from "@/services/data-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Search, FlaskConical, Layers, Atom, ArrowLeft, Plus, User } from "lucide-react";
import {
  interpretPH, interpretCE, interpretMO, interpretAzote, interpretPhosphore,
  interpretPotassium, interpretCalcium, interpretMagnesium, interpretSodium,
  interpretCEC, interpretFer, interpretZinc, interpretCuivre, interpretManganese,
  interpretBore, interpretGranulo,
} from "@/utils/soil-interpretations";

type ReportType = "physico_chimique" | "granulometrique" | "oligo_elements";
type View = "users" | "history" | "form" | "result";

const NAV_ITEMS: { key: ReportType; label: string; icon: typeof FlaskConical }[] = [
  { key: "physico_chimique", label: "Analyses Physico-Chimiques", icon: FlaskConical },
  { key: "granulometrique", label: "Analyse Granulométrique", icon: Layers },
  { key: "oligo_elements", label: "Analyse des oligo-éléments", icon: Atom },
];

interface SoilReport {
  id: string;
  client_id: string;
  report_type: string;
  created_at: string;
  ph: number | null;
  conductivite: number | null;
  matiere_organique: number | null;
  azote: number | null;
  phosphore: number | null;
  potassium: number | null;
  calcium: number | null;
  magnesium: number | null;
  sodium: number | null;
  cec: number | null;
  argile: number | null;
  limon: number | null;
  sable: number | null;
  fer: number | null;
  zinc: number | null;
  cuivre: number | null;
  manganese: number | null;
  bore: number | null;
}

function InterpretBadge({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-muted ${color}`}>{label}</span>;
}

function ResultRow({ num, label, value, unit, interp }: { num: number; label: string; value: number | null; unit: string; interp: { label: string; color: string } | null }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-emerald-600">{num}.</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{value} {unit}</span>
        {interp && <InterpretBadge label={interp.label} color={interp.color} />}
      </div>
    </div>
  );
}

export default function RapportSolPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [view, setView] = useState<View>("users");
  const [activeTab, setActiveTab] = useState<ReportType>("physico_chimique");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastReport, setLastReport] = useState<SoilReport | null>(null);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: reports = [] } = useQuery({
    queryKey: ["soil_reports"],
    queryFn: async () => {
      const { data } = await supabase.from("soil_reports").select("*").order("created_at", { ascending: false });
      return (data ?? []) as SoilReport[];
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await supabase.from("soil_reports").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["soil_reports"] }); toast({ title: "Rapport supprimé" }); },
  });

  const createMut = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await supabase.from("soil_reports").insert(payload as any).select().single();
      if (error) throw error;
      return data as SoilReport;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["soil_reports"] });
      setLastReport(data);
      setView("result");
      toast({ title: "Rapport créé" });
    },
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const clientReports = useMemo(() =>
    reports.filter((r) => r.client_id === selectedClientId),
    [reports, selectedClientId]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => { const v = fd.get(k); return v ? parseFloat(v as string) : null; };
    const payload: Record<string, unknown> = {
      client_id: selectedClientId,
      report_type: activeTab,
    };
    if (activeTab === "physico_chimique") {
      Object.assign(payload, { ph: num("ph"), conductivite: num("conductivite"), matiere_organique: num("matiere_organique"), azote: num("azote"), phosphore: num("phosphore"), potassium: num("potassium"), calcium: num("calcium"), magnesium: num("magnesium"), sodium: num("sodium"), cec: num("cec") });
    } else if (activeTab === "granulometrique") {
      Object.assign(payload, { argile: num("argile"), limon: num("limon"), sable: num("sable") });
    } else {
      Object.assign(payload, { fer: num("fer"), zinc: num("zinc"), cuivre: num("cuivre"), manganese: num("manganese"), bore: num("bore") });
    }
    createMut.mutate(payload);
  };

  const renderReportResult = (r: SoilReport) => {
    const client = clients.find((c) => c.id === r.client_id);
    const typeLabelMap: Record<string, string> = { physico_chimique: "Analyses Physico-Chimiques", granulometrique: "Analyse Granulométrique", oligo_elements: "Analyse des oligo-éléments" };
    return (
      <Card key={r.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{client ? `${client.firstName} ${client.lastName}` : "—"}</span>
              </div>
              <CardTitle className="text-base">{typeLabelMap[r.report_type] ?? r.report_type}</CardTitle>
              <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
            </div>
            <DeleteDialog onConfirm={() => deleteMut.mutate(r.id)} itemName="ce rapport" />
          </div>
        </CardHeader>
        <CardContent>
          {r.report_type === "physico_chimique" && (
            <div className="space-y-0">
              <ResultRow num={1} label="pH (eau) — ISO 10390" value={r.ph} unit="" interp={r.ph != null ? interpretPH(r.ph) : null} />
              <ResultRow num={2} label="Conductivité électrique (CE)" value={r.conductivite} unit="mS/cm" interp={r.conductivite != null ? interpretCE(r.conductivite) : null} />
              <ResultRow num={3} label="Matière organique" value={r.matiere_organique} unit="%" interp={r.matiere_organique != null ? interpretMO(r.matiere_organique) : null} />
              <ResultRow num={4} label="Azote total" value={r.azote} unit="%" interp={r.azote != null ? interpretAzote(r.azote) : null} />
              <ResultRow num={5} label="Phosphore assimilable (Olsen)" value={r.phosphore} unit="mg/kg" interp={r.phosphore != null ? interpretPhosphore(r.phosphore) : null} />
              <ResultRow num={6} label="Potassium échangeable" value={r.potassium} unit="mg/kg" interp={r.potassium != null ? interpretPotassium(r.potassium) : null} />
              <ResultRow num={7} label="Calcium" value={r.calcium} unit="mg/kg" interp={r.calcium != null ? interpretCalcium(r.calcium) : null} />
              <ResultRow num={8} label="Magnésium" value={r.magnesium} unit="mg/kg" interp={r.magnesium != null ? interpretMagnesium(r.magnesium) : null} />
              <ResultRow num={9} label="Sodium" value={r.sodium} unit="mg/kg" interp={r.sodium != null ? interpretSodium(r.sodium) : null} />
              <ResultRow num={10} label="CEC" value={r.cec} unit="meq/100g" interp={r.cec != null ? interpretCEC(r.cec) : null} />
            </div>
          )}
          {r.report_type === "granulometrique" && (
            <div className="space-y-0">
              <ResultRow num={1} label="Argile" value={r.argile} unit="%" interp={null} />
              <ResultRow num={2} label="Limon" value={r.limon} unit="%" interp={null} />
              <ResultRow num={3} label="Sable" value={r.sable} unit="%" interp={null} />
              {r.argile != null && r.limon != null && r.sable != null && (
                <div className="flex items-center justify-between py-2 mt-2 bg-muted/50 rounded-lg px-3">
                  <span className="text-sm font-medium">Texture du sol</span>
                  <span className="text-sm font-bold text-emerald-600">{interpretGranulo(r.argile, r.limon, r.sable)}</span>
                </div>
              )}
            </div>
          )}
          {r.report_type === "oligo_elements" && (
            <div className="space-y-0">
              <ResultRow num={1} label="Fer (Fe) — DTPA" value={r.fer} unit="mg/kg" interp={r.fer != null ? interpretFer(r.fer) : null} />
              <ResultRow num={2} label="Zinc (Zn) — DTPA" value={r.zinc} unit="mg/kg" interp={r.zinc != null ? interpretZinc(r.zinc) : null} />
              <ResultRow num={3} label="Cuivre (Cu) — DTPA" value={r.cuivre} unit="mg/kg" interp={r.cuivre != null ? interpretCuivre(r.cuivre) : null} />
              <ResultRow num={4} label="Manganèse (Mn) — DTPA" value={r.manganese} unit="mg/kg" interp={r.manganese != null ? interpretManganese(r.manganese) : null} />
              <ResultRow num={5} label="Bore (B)" value={r.bore} unit="mg/kg" interp={r.bore != null ? interpretBore(r.bore) : null} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ── Users list view ──
  if (view === "users") {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Rapport Sol</h2>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((c) => {
            const count = reports.filter((r) => r.client_id === c.id).length;
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedClientId(c.id); setView("history"); }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(c.firstName?.[0] ?? "").toUpperCase()}{(c.lastName?.[0] ?? "").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{count} rapport{count !== 1 ? "s" : ""}</span>
                </CardContent>
              </Card>
            );
          })}
          {filteredClients.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">Aucun utilisateur trouvé</p>}
        </div>
      </div>
    );
  }

  // ── History view ──
  if (view === "history") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setView("users"); setSelectedClientId(null); }}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h2 className="text-xl font-bold">{selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ""}</h2>
            <p className="text-sm text-muted-foreground">Historique des rapports sol</p>
          </div>
          <div className="ml-auto">
            <Button onClick={() => setView("form")}><Plus className="mr-2 h-4 w-4" />Nouveau rapport</Button>
          </div>
        </div>
        {clientReports.length === 0 && <p className="text-muted-foreground text-center py-12">Aucun rapport pour cet utilisateur</p>}
        {clientReports.map(renderReportResult)}
      </div>
    );
  }

  // ── Result view ──
  if (view === "result" && lastReport) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("history")}><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-xl font-bold">Résultat de l'analyse</h2>
        </div>
        {renderReportResult(lastReport)}
        <Button variant="outline" onClick={() => setView("history")}>Retour à l'historique</Button>
      </div>
    );
  }

  // ── Form view with left nav ──
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setView("history")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h2 className="text-xl font-bold">Nouveau rapport — {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ""}</h2>
        </div>
      </div>
      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-64 shrink-0 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${activeTab === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">{NAV_ITEMS.find((n) => n.key === activeTab)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "physico_chimique" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label><span className="text-emerald-600 font-bold mr-1">1.</span>pH (eau)</Label><Input name="ph" type="number" step="0.01" min="0" max="14" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">2.</span>Conductivité (mS/cm)</Label><Input name="conductivite" type="number" step="0.01" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">3.</span>Matière organique (%)</Label><Input name="matiere_organique" type="number" step="0.01" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">4.</span>Azote total (%)</Label><Input name="azote" type="number" step="0.001" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">5.</span>Phosphore (mg/kg)</Label><Input name="phosphore" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">6.</span>Potassium (mg/kg)</Label><Input name="potassium" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">7.</span>Calcium (mg/kg)</Label><Input name="calcium" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">8.</span>Magnésium (mg/kg)</Label><Input name="magnesium" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">9.</span>Sodium (mg/kg)</Label><Input name="sodium" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">10.</span>CEC (meq/100g)</Label><Input name="cec" type="number" step="0.1" required /></div>
                </div>
              )}
              {activeTab === "granulometrique" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label><span className="text-emerald-600 font-bold mr-1">1.</span>Argile (%)</Label><Input name="argile" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">2.</span>Limon (%)</Label><Input name="limon" type="number" step="0.1" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">3.</span>Sable (%)</Label><Input name="sable" type="number" step="0.1" required /></div>
                </div>
              )}
              {activeTab === "oligo_elements" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label><span className="text-emerald-600 font-bold mr-1">1.</span>Fer (mg/kg)</Label><Input name="fer" type="number" step="0.01" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">2.</span>Zinc (mg/kg)</Label><Input name="zinc" type="number" step="0.01" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">3.</span>Cuivre (mg/kg)</Label><Input name="cuivre" type="number" step="0.01" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">4.</span>Manganèse (mg/kg)</Label><Input name="manganese" type="number" step="0.01" required /></div>
                  <div><Label><span className="text-emerald-600 font-bold mr-1">5.</span>Bore (mg/kg)</Label><Input name="bore" type="number" step="0.01" required /></div>
                </div>
              )}
              <Button type="submit" disabled={createMut.isPending}>Enregistrer et voir les résultats</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
