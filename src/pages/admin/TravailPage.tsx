import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, getSurfaces, getVannes, getTypesPlante, updateClient, updateSurface, createSurface, createPlante, createVanne } from "@/services/data-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Wifi, WifiOff, Droplets, MapPin, Leaf, SlidersHorizontal, X, Pencil, CreditCard, ArrowRight, ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Client, Surface } from "@/types/models";
import LocationPicker from "@/components/LocationPicker";

function SubscriptionBadge({ client, t }: { client: Client; t: (k: string) => string }) {
  if (!client.dateExpAbo || !client.typeAbo) {
    return <Badge variant="outline" className="text-xs text-muted-foreground">{t("sub.noSub")}</Badge>;
  }
  const diff = Math.ceil((new Date(client.dateExpAbo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpired = diff <= 0;
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={isExpired ? "destructive" : "default"} className="text-xs">
        <CreditCard className="mr-1 h-3 w-3" />
        {t(`sub.${client.typeAbo}`)}
      </Badge>
      <span className={`text-xs font-medium ${isExpired ? "text-destructive" : "text-primary"}`}>
        {isExpired ? t("sub.expired") : `${diff} ${t("sub.daysLeft")}`}
      </span>
    </div>
  );
}

interface VanneData { nomVanne: string; nbPlantParVanne: number; debitEauParVanne: number; }

export default function TravailPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHasSurfaces, setFilterHasSurfaces] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingSurface, setEditingSurface] = useState<Surface | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: surfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: vannes = [] } = useQuery({ queryKey: ["vannes"], queryFn: getVannes });
  const { data: typesList = [] } = useQuery({ queryKey: ["types-plante"], queryFn: getTypesPlante });

  const updateClientMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setEditingClient(null); toast({ title: t("users.updated") }); },
  });
  const updateSurfaceMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Surface> }) => updateSurface(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surfaces"] }); setEditingSurface(null); toast({ title: t("surface.updated") }); },
  });

  const locations = useMemo(() => Array.from(new Set(surfaces.map((s) => s.localisation))), [surfaces]);
  const activeFilters = useMemo(() => [filterLocation, filterStatus, filterHasSurfaces].filter(f => f !== "all").length, [filterLocation, filterStatus, filterHasSurfaces]);
  const clearFilters = () => { setFilterLocation("all"); setFilterStatus("all"); setFilterHasSurfaces("all"); setSearch(""); };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch = search === "" || `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      const cs = surfaces.filter((s) => s.fkClient === c.id);
      if (filterLocation !== "all" && !cs.some((s) => s.localisation === filterLocation)) return false;
      if (filterHasSurfaces === "yes" && cs.length === 0) return false;
      if (filterHasSurfaces === "no" && cs.length > 0) return false;
      return true;
    });
  }, [clients, search, filterLocation, filterStatus, filterHasSurfaces, surfaces]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("travail.title")}</h2>
        <Button onClick={() => setShowWizard(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> {t("travail.newProject")}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("travail.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant={showAdvanced ? "default" : "outline"} onClick={() => setShowAdvanced(!showAdvanced)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> {t("travail.filters")}
            {activeFilters > 0 && <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{activeFilters}</Badge>}
          </Button>
        </div>
        {showAdvanced && (
          <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-muted/30">
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder={t("travail.allLocations")} /></SelectTrigger>
              <SelectContent><SelectItem value="all">{t("travail.allLocations")}</SelectItem>{locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterHasSurfaces} onValueChange={setFilterHasSurfaces}>
              <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">{t("travail.allSurfaces")}</SelectItem><SelectItem value="yes">{t("travail.withSurfaces")}</SelectItem><SelectItem value="no">{t("travail.withoutSurfaces")}</SelectItem></SelectContent>
            </Select>
            {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground"><X className="mr-1 h-3 w-3" /> {t("travail.clearFilters")}</Button>}
          </div>
        )}
      </div>

      {/* User Blocks */}
      <div className="space-y-6">
        {filteredClients.map((client) => {
          const clientSurfaces = filterLocation !== "all" ? surfaces.filter((s) => s.fkClient === client.id && s.localisation === filterLocation) : surfaces.filter((s) => s.fkClient === client.id);
          return (
            <Card key={client.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="cursor-pointer" onClick={() => navigate(`/admin/travail/client/${client.id}`)}>
                  <CardTitle className="text-lg">{client.firstName} {client.lastName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  <div className="mt-1"><SubscriptionBadge client={client} t={t} /></div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setEditingClient(client)} className="text-muted-foreground"><Pencil className="h-3 w-3" /></Button>
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10"><Wifi className="mr-1 h-3 w-3" /> {t("travail.connect")}</Button>
                  </div>
                  <div className="flex items-center gap-1"><WifiOff className="h-3 w-3 text-destructive" /><span className="text-xs text-destructive font-medium">{t("travail.disconnected")}</span></div>
                </div>
              </CardHeader>
              <CardContent>
                {clientSurfaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">{t("travail.noSurface")}</p>
                ) : (
                  <div className="space-y-3">
                    {clientSurfaces.map((surface) => {
                      const surfaceVannes = vannes.filter((v) => v.fkSurface === surface.id);
                      return (
                        <div key={surface.id} className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-foreground cursor-pointer" onClick={() => navigate(`/admin/travail/surface/${surface.id}`)}>{surface.nomSurface}</h4>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditingSurface(surface)}><Pencil className="h-3 w-3 text-muted-foreground" /></Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {surface.localisation}</div>
                            <div className="flex items-center gap-1"><Leaf className="h-3 w-3" /> {surface.nbVanne} {t("common.plants")}</div>
                          </div>
                          {surfaceVannes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {surfaceVannes.map((v) => <Badge key={v.id} variant="secondary" className="text-xs"><Droplets className="mr-1 h-3 w-3" /> {v.nomVanne}</Badge>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredClients.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>{t("travail.noUser")}</p></div>}
      </div>

      <EditClientDialog client={editingClient} onClose={() => setEditingClient(null)} onSave={(id, data) => updateClientMut.mutate({ id, data })} />
      <EditSurfaceDialog surface={editingSurface} onClose={() => setEditingSurface(null)} onSave={(id, data) => updateSurfaceMut.mutate({ id, data })} />
      <NewProjectDialog open={showWizard} onClose={() => setShowWizard(false)} clients={clients} typesList={typesList} qc={qc} t={t} />
    </div>
  );
}

function EditClientDialog({ client, onClose, onSave }: { client: Client | null; onClose: () => void; onSave: (id: string, data: Partial<Client>) => void }) {
  const { t } = useLanguage();
  return (
    <Dialog open={!!client} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("travail.edit")} - {client?.firstName} {client?.lastName}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (!client) return; const fd = new FormData(e.currentTarget); onSave(client.id, { firstName: fd.get("firstName") as string, lastName: fd.get("lastName") as string, email: fd.get("email") as string, phoneNumber: fd.get("phoneNumber") as string }); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t("auth.firstName")}</Label><Input name="firstName" defaultValue={client?.firstName} /></div>
            <div><Label>{t("auth.lastName")}</Label><Input name="lastName" defaultValue={client?.lastName} /></div>
          </div>
          <div><Label>{t("auth.email")}</Label><Input name="email" defaultValue={client?.email} /></div>
          <div><Label>{t("auth.phone")}</Label><Input name="phoneNumber" defaultValue={client?.phoneNumber} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button><Button type="submit">{t("common.save")}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSurfaceDialog({ surface, onClose, onSave }: { surface: Surface | null; onClose: () => void; onSave: (id: string, data: Partial<Surface>) => void }) {
  const { t } = useLanguage();
  const [loc, setLoc] = useState(surface?.localisation ?? "");
  return (
    <Dialog open={!!surface} onOpenChange={(o) => { if (!o) onClose(); else if (surface) setLoc(surface.localisation); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("travail.edit")} - {surface?.nomSurface}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (!surface) return; const fd = new FormData(e.currentTarget); onSave(surface.id, { nomSurface: fd.get("nomSurface") as string, localisation: loc }); }} className="space-y-4">
          <div><Label>Nom</Label><Input name="nomSurface" defaultValue={surface?.nomSurface} /></div>
          <div><Label>{t("surface.location")}</Label><LocationPicker value={loc} onChange={setLoc} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button><Button type="submit">{t("common.save")}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewProjectDialog({ open, onClose, clients, typesList, qc, t }: { open: boolean; onClose: () => void; clients: Client[]; typesList: any[]; qc: any; t: (k: string) => string }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [nomSurface, setNomSurface] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [fkClient, setFkClient] = useState("");
  const [nomPlante, setNomPlante] = useState("");
  const [agePlante, setAgePlante] = useState(0);
  const [fkTypePlante, setFkTypePlante] = useState("");
  const [nbVanne, setNbVanne] = useState(1);
  const [vannesData, setVannesData] = useState<VanneData[]>([{ nomVanne: "", nbPlantParVanne: 0, debitEauParVanne: 0 }]);

  const updateNbVanne = (n: number) => {
    setNbVanne(n);
    const arr = [...vannesData];
    while (arr.length < n) arr.push({ nomVanne: "", nbPlantParVanne: 0, debitEauParVanne: 0 });
    setVannesData(arr.slice(0, n));
  };

  const canStep1 = nomSurface && localisation && fkClient && nomPlante && fkTypePlante;
  const canStep2 = vannesData.every(v => v.nomVanne && v.debitEauParVanne > 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const surface = await createSurface({ nomSurface, localisation, fkClient });
      await createPlante({ nomPlante, age: agePlante, fkTypePlante, fkSurface: surface.id });
      for (const v of vannesData) {
        await createVanne({ nomVanne: v.nomVanne, nbPlantParVanne: v.nbPlantParVanne, debitEauParVanne: v.debitEauParVanne, fkSurface: surface.id });
      }
      qc.invalidateQueries({ queryKey: ["surfaces"] });
      qc.invalidateQueries({ queryKey: ["plantes"] });
      qc.invalidateQueries({ queryKey: ["vannes"] });
      toast({ title: t("wizard.success") });
      // Reset
      setStep(0); setNomSurface(""); setLocalisation(""); setFkClient(""); setNomPlante(""); setAgePlante(0); setFkTypePlante(""); setNbVanne(1); setVannesData([{ nomVanne: "", nbPlantParVanne: 0, debitEauParVanne: 0 }]);
      onClose();
    } catch { toast({ title: "Erreur", variant: "destructive" }); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t("travail.newProject")}</DialogTitle></DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-4">
          {[t("wizard.step1"), t("wizard.step2")].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <span className={`text-sm ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
              {i < 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>{t("wizard.surfaceName")}</Label><Input value={nomSurface} onChange={e => setNomSurface(e.target.value)} required /></div>
              <div><Label>{t("wizard.location")}</Label><LocationPicker value={localisation} onChange={setLocalisation} /></div>
              <div>
                <Label>{t("wizard.user")}</Label>
                <Select value={fkClient} onValueChange={setFkClient}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("wizard.plantName")}</Label><Input value={nomPlante} onChange={e => setNomPlante(e.target.value)} required /></div>
              <div><Label>{t("wizard.plantAge")}</Label><Input type="number" min="0" value={agePlante} onChange={e => setAgePlante(parseInt(e.target.value) || 0)} /></div>
              <div>
                <Label>{t("wizard.plantType")}</Label>
                <Select value={fkTypePlante} onValueChange={setFkTypePlante}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{typesList.map(tp => <SelectItem key={tp.id} value={tp.id}>{tp.nomPlante}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("wizard.nbVannes")}</Label><Input type="number" min="1" value={nbVanne} onChange={e => updateNbVanne(Math.max(1, parseInt(e.target.value) || 1))} /></div>
            </div>
            <div className="flex justify-end"><Button onClick={() => setStep(1)} disabled={!canStep1}>{t("wizard.next")} <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {vannesData.map((v, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-3">
                <h4 className="font-semibold text-sm">Vanne {i + 1}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>{t("wizard.vanneName")}</Label><Input value={v.nomVanne} onChange={e => { const arr = [...vannesData]; arr[i] = { ...arr[i], nomVanne: e.target.value }; setVannesData(arr); }} /></div>
                  <div><Label>{t("wizard.vanneNbPlant")}</Label><Input type="number" min="0" value={v.nbPlantParVanne} onChange={e => { const arr = [...vannesData]; arr[i] = { ...arr[i], nbPlantParVanne: parseInt(e.target.value) || 0 }; setVannesData(arr); }} /></div>
                  <div><Label>{t("wizard.vanneDebit")}</Label><Input type="number" step="0.1" min="0" value={v.debitEauParVanne} onChange={e => { const arr = [...vannesData]; arr[i] = { ...arr[i], debitEauParVanne: parseFloat(e.target.value) || 0 }; setVannesData(arr); }} /></div>
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="mr-2 h-4 w-4" /> {t("wizard.prev")}</Button>
              <Button onClick={handleSave} disabled={saving || !canStep2}><Save className="mr-2 h-4 w-4" /> {saving ? t("wizard.saving") : t("common.save")}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
