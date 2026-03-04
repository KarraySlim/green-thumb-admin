import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSols, createSol, updateSol, deleteSol, getClimats, createClimat, updateClimat, deleteClimat, getSurfaces, getProfiles } from "@/services/data-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Mountain, Thermometer, Droplets, Wind, Sun, User } from "lucide-react";
import { Sol, Climat } from "@/types/models";

export default function CapteurPage() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: sols = [] } = useQuery({ queryKey: ["sols"], queryFn: getSols });
  const { data: climats = [] } = useQuery({ queryKey: ["climats"], queryFn: getClimats });
  const { data: surfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: getProfiles });

  const [showSolForm, setShowSolForm] = useState(false);
  const [editingSol, setEditingSol] = useState<Sol | null>(null);
  const [showClimatForm, setShowClimatForm] = useState(false);
  const [editingClimat, setEditingClimat] = useState<Climat | null>(null);

  const createSolMut = useMutation({ mutationFn: createSol, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sols"] }); setShowSolForm(false); toast({ title: t("capteur.solCreated") }); } });
  const updateSolMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Sol> }) => updateSol(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sols"] }); setEditingSol(null); toast({ title: t("capteur.solUpdated") }); } });
  const deleteSolMut = useMutation({ mutationFn: deleteSol, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sols"] }); toast({ title: t("capteur.solDeleted") }); } });

  const createClimatMut = useMutation({ mutationFn: createClimat, onSuccess: () => { qc.invalidateQueries({ queryKey: ["climats"] }); setShowClimatForm(false); toast({ title: t("capteur.climatCreated") }); } });
  const updateClimatMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Climat> }) => updateClimat(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["climats"] }); setEditingClimat(null); toast({ title: t("capteur.climatUpdated") }); } });
  const deleteClimatMut = useMutation({ mutationFn: deleteClimat, onSuccess: () => { qc.invalidateQueries({ queryKey: ["climats"] }); toast({ title: t("capteur.climatDeleted") }); } });

  const getUserForEntity = (entityId: string, field: "fkSol" | "fkClimat") => {
    const surface = surfaces.find(s => s[field] === entityId);
    if (!surface) return { user: null, surface: null };
    return { user: profiles.find(p => p.id === surface.fkUser) ?? null, surface };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t("nav.capteurs")}</h2>
      <Tabs defaultValue="sol">
        <TabsList>
          <TabsTrigger value="sol"><Mountain className="mr-1 h-4 w-4" /> {t("capteur.sol")}</TabsTrigger>
          <TabsTrigger value="climat"><Thermometer className="mr-1 h-4 w-4" /> {t("capteur.climat")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sol" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowSolForm(!showSolForm)}><Plus className="mr-2 h-4 w-4" /> {t("capteur.newSol")}</Button>
          </div>
          {showSolForm && (
            <Card><CardContent className="pt-4">
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createSolMut.mutate({ nature: fd.get("nature") as string, humidite: parseFloat(fd.get("humidite") as string), salinite: parseFloat(fd.get("salinite") as string), ph: parseFloat(fd.get("ph") as string), temperature: parseFloat(fd.get("temperature") as string), dateMesure: new Date().toISOString() }); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>{t("capteur.nature")}</Label><Input name="nature" required /></div>
                <div><Label>{t("capteur.humidity")} (%)</Label><Input name="humidite" type="number" step="0.1" required /></div>
                <div><Label>{t("capteur.salinity")}</Label><Input name="salinite" type="number" step="0.01" required /></div>
                <div><Label>pH</Label><Input name="ph" type="number" step="0.1" min="0" max="14" required /></div>
                <div><Label>{t("capteur.temperature")} (°C)</Label><Input name="temperature" type="number" step="0.1" required /></div>
                <div className="flex items-end gap-2"><Button type="submit">{t("common.create")}</Button><Button type="button" variant="outline" onClick={() => setShowSolForm(false)}>{t("common.cancel")}</Button></div>
              </form>
            </CardContent></Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sols.map(s => {
              const { user, surface } = getUserForEntity(s.id, "fkSol");
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Mountain className="h-4 w-4 text-primary" /> {s.nature}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingSol(s)}><Pencil className="h-3 w-3" /></Button>
                      <DeleteDialog onConfirm={() => deleteSolMut.mutate(s.id)} itemName={s.nature} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {user && <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><User className="h-3 w-3" /> {user.first_name} {user.last_name} {surface && `· ${surface.nomSurface}`}</div>}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">{t("capteur.humidity")}:</span> {s.humidite}%</div>
                      <div><span className="text-muted-foreground">{t("capteur.salinity")}:</span> {s.salinite}</div>
                      <div><span className="text-muted-foreground">pH:</span> {s.ph}</div>
                      <div><span className="text-muted-foreground">{t("capteur.temperature")}:</span> {s.temperature}°C</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{new Date(s.dateMesure).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              );
            })}
            {sols.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">{t("capteur.noSol")}</p>}
          </div>
        </TabsContent>

        <TabsContent value="climat" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowClimatForm(!showClimatForm)}><Plus className="mr-2 h-4 w-4" /> {t("capteur.newClimat")}</Button>
          </div>
          {showClimatForm && (
            <Card><CardContent className="pt-4">
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createClimatMut.mutate({ temperatureC: parseFloat(fd.get("temperatureC") as string), humiditeC: parseFloat(fd.get("humiditeC") as string), vitesseVent: parseFloat(fd.get("vitesseVent") as string), puissanceEnsoleillement: parseFloat(fd.get("puissanceEnsoleillement") as string) }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>{t("capteur.temperature")} (°C)</Label><Input name="temperatureC" type="number" step="0.1" required /></div>
                <div><Label>{t("capteur.humidity")} (%)</Label><Input name="humiditeC" type="number" step="0.1" required /></div>
                <div><Label>{t("capteur.windSpeed")} (km/h)</Label><Input name="vitesseVent" type="number" step="0.1" required /></div>
                <div><Label>{t("capteur.sunPower")} (W/m²)</Label><Input name="puissanceEnsoleillement" type="number" step="1" required /></div>
                <div className="md:col-span-2 flex gap-2"><Button type="submit">{t("common.create")}</Button><Button type="button" variant="outline" onClick={() => setShowClimatForm(false)}>{t("common.cancel")}</Button></div>
              </form>
            </CardContent></Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {climats.map(c => {
              const { user, surface } = getUserForEntity(c.id, "fkClimat");
              return (
                <Card key={c.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Thermometer className="h-4 w-4 text-primary" /> {c.temperatureC}°C</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingClimat(c)}><Pencil className="h-3 w-3" /></Button>
                      <DeleteDialog onConfirm={() => deleteClimatMut.mutate(c.id)} itemName={`${c.temperatureC}°C`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {user && <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><User className="h-3 w-3" /> {user.first_name} {user.last_name} {surface && `· ${surface.nomSurface}`}</div>}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {c.temperatureC}°C</div>
                      <div className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {c.humiditeC}%</div>
                      <div className="flex items-center gap-1"><Wind className="h-3 w-3" /> {c.vitesseVent} km/h</div>
                      <div className="flex items-center gap-1"><Sun className="h-3 w-3" /> {c.puissanceEnsoleillement} W/m²</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {climats.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">{t("capteur.noClimat")}</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingSol} onOpenChange={(o) => !o && setEditingSol(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("capteur.editSol")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!editingSol) return; const fd = new FormData(e.currentTarget); updateSolMut.mutate({ id: editingSol.id, data: { nature: fd.get("nature") as string, humidite: parseFloat(fd.get("humidite") as string), salinite: parseFloat(fd.get("salinite") as string), ph: parseFloat(fd.get("ph") as string), temperature: parseFloat(fd.get("temperature") as string) } }); }} className="space-y-4">
            <div><Label>{t("capteur.nature")}</Label><Input name="nature" defaultValue={editingSol?.nature} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("capteur.humidity")} (%)</Label><Input name="humidite" type="number" step="0.1" defaultValue={editingSol?.humidite} required /></div>
              <div><Label>{t("capteur.salinity")}</Label><Input name="salinite" type="number" step="0.01" defaultValue={editingSol?.salinite} required /></div>
              <div><Label>pH</Label><Input name="ph" type="number" step="0.1" defaultValue={editingSol?.ph} required /></div>
              <div><Label>{t("capteur.temperature")} (°C)</Label><Input name="temperature" type="number" step="0.1" defaultValue={editingSol?.temperature} required /></div>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingSol(null)}>{t("common.cancel")}</Button><Button type="submit">{t("common.save")}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingClimat} onOpenChange={(o) => !o && setEditingClimat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("capteur.editClimat")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!editingClimat) return; const fd = new FormData(e.currentTarget); updateClimatMut.mutate({ id: editingClimat.id, data: { temperatureC: parseFloat(fd.get("temperatureC") as string), humiditeC: parseFloat(fd.get("humiditeC") as string), vitesseVent: parseFloat(fd.get("vitesseVent") as string), puissanceEnsoleillement: parseFloat(fd.get("puissanceEnsoleillement") as string) } }); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("capteur.temperature")} (°C)</Label><Input name="temperatureC" type="number" step="0.1" defaultValue={editingClimat?.temperatureC} required /></div>
              <div><Label>{t("capteur.humidity")} (%)</Label><Input name="humiditeC" type="number" step="0.1" defaultValue={editingClimat?.humiditeC} required /></div>
              <div><Label>{t("capteur.windSpeed")} (km/h)</Label><Input name="vitesseVent" type="number" step="0.1" defaultValue={editingClimat?.vitesseVent} required /></div>
              <div><Label>{t("capteur.sunPower")} (W/m²)</Label><Input name="puissanceEnsoleillement" type="number" step="1" defaultValue={editingClimat?.puissanceEnsoleillement} required /></div>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingClimat(null)}>{t("common.cancel")}</Button><Button type="submit">{t("common.save")}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
