import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, getSurfaces, getVannes, updateClient, updateSurface } from "@/services/data-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Wifi, WifiOff, Droplets, MapPin, Leaf, SlidersHorizontal, X, Pencil, CalendarDays, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Client, Surface } from "@/types/models";

function SubscriptionBadge({ client, t }: { client: Client; t: (k: string) => string }) {
  if (!client.dateExpAbo || !client.typeAbo) {
    return <Badge variant="outline" className="text-xs text-muted-foreground">{t("sub.noSub")}</Badge>;
  }
  const now = new Date();
  const exp = new Date(client.dateExpAbo);
  const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = diff <= 0;
  const typeLabel = t(`sub.${client.typeAbo}`);

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={isExpired ? "destructive" : "default"} className="text-xs">
        <CreditCard className="mr-1 h-3 w-3" />
        {typeLabel}
      </Badge>
      <span className={`text-xs font-medium ${isExpired ? "text-destructive" : "text-primary"}`}>
        {isExpired ? t("sub.expired") : `${diff} ${t("sub.daysLeft")}`}
      </span>
    </div>
  );
}

export default function TravailPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHasSurfaces, setFilterHasSurfaces] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Edit states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingSurface, setEditingSurface] = useState<Surface | null>(null);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: surfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: vannes = [] } = useQuery({ queryKey: ["vannes"], queryFn: getVannes });

  const updateClientMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setEditingClient(null); toast({ title: "Client modifié" }); },
  });

  const updateSurfaceMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Surface> }) => updateSurface(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surfaces"] }); setEditingSurface(null); toast({ title: "Surface modifiée" }); },
  });

  const locations = useMemo(() => {
    const locs = new Set(surfaces.map((s) => s.localisation));
    return Array.from(locs);
  }, [surfaces]);

  const activeFilters = useMemo(() => {
    let count = 0;
    if (filterLocation !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterHasSurfaces !== "all") count++;
    return count;
  }, [filterLocation, filterStatus, filterHasSurfaces]);

  const clearFilters = () => { setFilterLocation("all"); setFilterStatus("all"); setFilterHasSurfaces("all"); setSearch(""); };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch = search === "" ||
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      const clientSurfaces = surfaces.filter((s) => s.fkClient === c.id);
      if (filterLocation !== "all" && !clientSurfaces.some((s) => s.localisation === filterLocation)) return false;
      if (filterHasSurfaces === "yes" && clientSurfaces.length === 0) return false;
      if (filterHasSurfaces === "no" && clientSurfaces.length > 0) return false;
      return true;
    });
  }, [clients, search, filterLocation, filterStatus, filterHasSurfaces, surfaces]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("travail.title")}</h2>
        <Button onClick={() => navigate("/admin/wizard")} className="bg-primary hover:bg-primary/90">
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
            {activeFilters > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{activeFilters}</Badge>
            )}
          </Button>
        </div>

        {showAdvanced && (
          <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-muted/30">
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder={t("travail.allLocations")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("travail.allLocations")}</SelectItem>
                {locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("travail.allStatuses")}</SelectItem>
                <SelectItem value="connected">{t("travail.connected")}</SelectItem>
                <SelectItem value="disconnected">{t("travail.disconnected")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterHasSurfaces} onValueChange={setFilterHasSurfaces}>
              <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("travail.allSurfaces")}</SelectItem>
                <SelectItem value="yes">{t("travail.withSurfaces")}</SelectItem>
                <SelectItem value="no">{t("travail.withoutSurfaces")}</SelectItem>
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="mr-1 h-3 w-3" /> {t("travail.clearFilters")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Client Blocks */}
      <div className="space-y-6">
        {filteredClients.map((client) => {
          const clientSurfaces = filterLocation !== "all"
            ? surfaces.filter((s) => s.fkClient === client.id && s.localisation === filterLocation)
            : surfaces.filter((s) => s.fkClient === client.id);

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
                    <Button variant="outline" size="sm" onClick={() => setEditingClient(client)} className="text-muted-foreground">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                      <Wifi className="mr-1 h-3 w-3" /> {t("travail.connect")}
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive font-medium">{t("travail.disconnected")}</span>
                  </div>
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
                            <h4 className="font-semibold text-sm text-foreground cursor-pointer" onClick={() => navigate(`/admin/travail/surface/${surface.id}`)}>
                              {surface.nomSurface}
                            </h4>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditingSurface(surface)}>
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {surface.localisation}</div>
                            <div className="flex items-center gap-1"><Leaf className="h-3 w-3" /> {surface.nbVanne} {t("common.plants")}</div>
                          </div>
                          {surfaceVannes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {surfaceVannes.map((v) => (
                                <Badge key={v.id} variant="secondary" className="text-xs"><Droplets className="mr-1 h-3 w-3" /> {v.nomVanne}</Badge>
                              ))}
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
        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><p>{t("travail.noClient")}</p></div>
        )}
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog client={editingClient} onClose={() => setEditingClient(null)} onSave={(id, data) => updateClientMut.mutate({ id, data })} />

      {/* Edit Surface Dialog */}
      <EditSurfaceDialog surface={editingSurface} onClose={() => setEditingSurface(null)} onSave={(id, data) => updateSurfaceMut.mutate({ id, data })} />
    </div>
  );
}

function EditClientDialog({ client, onClose, onSave }: { client: Client | null; onClose: () => void; onSave: (id: string, data: Partial<Client>) => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Partial<Client>>({});

  const handleOpen = () => {
    if (client) setForm({ firstName: client.firstName, lastName: client.lastName, email: client.email, phoneNumber: client.phoneNumber });
  };

  return (
    <Dialog open={!!client} onOpenChange={(open) => { if (!open) onClose(); else handleOpen(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("travail.edit")} - {client?.firstName} {client?.lastName}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (client) onSave(client.id, form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t("auth.firstName")}</Label><Input defaultValue={client?.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} /></div>
            <div><Label>{t("auth.lastName")}</Label><Input defaultValue={client?.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div><Label>{t("auth.email")}</Label><Input defaultValue={client?.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div><Label>{t("auth.phone")}</Label><Input defaultValue={client?.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSurfaceDialog({ surface, onClose, onSave }: { surface: Surface | null; onClose: () => void; onSave: (id: string, data: Partial<Surface>) => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Partial<Surface>>({});

  return (
    <Dialog open={!!surface} onOpenChange={(open) => { if (!open) onClose(); else if (surface) setForm({ nomSurface: surface.nomSurface, localisation: surface.localisation }); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("travail.edit")} - {surface?.nomSurface}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (surface) onSave(surface.id, form); }} className="space-y-4">
          <div><Label>Nom</Label><Input defaultValue={surface?.nomSurface} onChange={(e) => setForm((f) => ({ ...f, nomSurface: e.target.value }))} /></div>
          <div><Label>{t("surface.location")}</Label><Input defaultValue={surface?.localisation} onChange={(e) => setForm((f) => ({ ...f, localisation: e.target.value }))} /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
