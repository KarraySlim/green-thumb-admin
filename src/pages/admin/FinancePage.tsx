import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfiles } from "@/services/data-service";
import { useFilteredProfiles } from "@/hooks/useRoleFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, ShoppingCart, CreditCard, Cpu, Package, ShieldCheck } from "lucide-react";

type Device = { id: string; name: string; device_type: string; price_dt: number; connected_state: string; available: boolean; stock: number; info: string | null; };
type Plan = { id: string; name: string; price_dt: number; duration_days: number; features: string[]; active: boolean; };
type Sale = { id: string; device_id: string; buyer_profile_id: string; quantity: number; unit_price_dt: number; total_dt: number; payment_method: string; status: string; created_at: string; validated_at: string | null; };
type SubPay = { id: string; profile_id: string; plan_id: string; amount_dt: number; payment_method: string; status: string; date_start: string | null; date_exp: string | null; created_at: string; };

const DT = (n: number) => `${Number(n ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} DT`;
const METHODS = ["carte", "virement", "electronique", "main_a_main"];
const METHOD_LABEL: Record<string, string> = { carte: "Carte bancaire", virement: "Virement", electronique: "Paiement électronique", main_a_main: "Main à main" };

export default function FinancePage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const isAdmin = profile?.user_role === "ADMIN" || profile?.user_role === "SOUS_ADMIN";

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("finance-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, () => qc.invalidateQueries({ queryKey: ["devices"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "subscription_plans" }, () => qc.invalidateQueries({ queryKey: ["plans"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "device_sales" }, () => qc.invalidateQueries({ queryKey: ["sales"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "subscription_payments" }, () => qc.invalidateQueries({ queryKey: ["subpays"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const { data: devices = [] } = useQuery<Device[]>({ queryKey: ["devices"], queryFn: async () => (await supabase.from("devices").select("*").order("created_at", { ascending: false })).data as any || [] });
  const { data: plans = [] } = useQuery<Plan[]>({ queryKey: ["plans"], queryFn: async () => (await supabase.from("subscription_plans").select("*").order("price_dt")).data as any || [] });
  const { data: sales = [] } = useQuery<Sale[]>({ queryKey: ["sales"], queryFn: async () => (await supabase.from("device_sales").select("*").order("created_at", { ascending: false })).data as any || [] });
  const { data: subpays = [] } = useQuery<SubPay[]>({ queryKey: ["subpays"], queryFn: async () => (await supabase.from("subscription_payments").select("*").order("created_at", { ascending: false })).data as any || [] });
  const { data: allProfiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: getProfiles });
  const profiles = useFilteredProfiles(allProfiles);
  const profById = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  const devById = useMemo(() => Object.fromEntries(devices.map(d => [d.id, d])), [devices]);
  const planById = useMemo(() => Object.fromEntries(plans.map(p => [p.id, p])), [plans]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Finance</h2>
        <p className="text-sm text-muted-foreground">Gestion des appareils, abonnements et paiements</p>
      </div>

      <Tabs defaultValue="devices">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="devices"><Cpu className="h-4 w-4 mr-1.5" />Appareils</TabsTrigger>
          <TabsTrigger value="sales"><ShoppingCart className="h-4 w-4 mr-1.5" />Ventes</TabsTrigger>
          <TabsTrigger value="plans"><Package className="h-4 w-4 mr-1.5" />Abonnements</TabsTrigger>
          <TabsTrigger value="subpays"><ShieldCheck className="h-4 w-4 mr-1.5" />Paiements abos</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="mt-4"><DevicesTab devices={devices} isAdmin={isAdmin} profiles={profiles} /></TabsContent>
        <TabsContent value="sales" className="mt-4"><SalesTab sales={sales} devById={devById} profById={profById} isAdmin={isAdmin} userId={profile?.id} /></TabsContent>
        <TabsContent value="plans" className="mt-4"><PlansTab plans={plans} isAdmin={isAdmin} profiles={profiles} /></TabsContent>
        <TabsContent value="subpays" className="mt-4"><SubPaysTab subpays={subpays} planById={planById} profById={profById} isAdmin={isAdmin} userId={profile?.id} /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ============== DEVICES ============== */
function DevicesTab({ devices, isAdmin, profiles }: { devices: Device[]; isAdmin: boolean; profiles: any[] }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Partial<Device> | null>(null);
  const [buying, setBuying] = useState<Device | null>(null);

  const save = useMutation({
    mutationFn: async (d: Partial<Device>) => {
      if (d.id) return (await supabase.from("devices").update(d).eq("id", d.id)).error;
      return (await supabase.from("devices").insert(d as any)).error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["devices"] }); setEdit(null); toast({ title: "Appareil enregistré" }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => (await supabase.from("devices").delete().eq("id", id)).error,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["devices"] }); toast({ title: "Supprimé" }); },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Catalogue appareils</CardTitle>
        {isAdmin && <Button size="sm" onClick={() => setEdit({ name: "", device_type: "capteur_sol", price_dt: 0, connected_state: "non_connecte", available: true, stock: 0, info: "" })}><Plus className="h-4 w-4 mr-1" />Nouvel appareil</Button>}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Dispo</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}<div className="text-xs text-muted-foreground">{d.info}</div></TableCell>
                <TableCell><Badge variant="outline">{d.device_type}</Badge></TableCell>
                <TableCell>
                  <Badge className={d.connected_state === "connecte" ? "bg-emerald-500/15 text-emerald-700 border-emerald-300" : "bg-gray-500/15 text-gray-700 border-gray-300"} variant="outline">
                    {d.connected_state === "connecte" ? "🟢 Connecté" : "⚪ Non connecté"}
                  </Badge>
                </TableCell>
                <TableCell>{d.stock}</TableCell>
                <TableCell className="font-semibold">{DT(d.price_dt)}</TableCell>
                <TableCell>{d.available ? <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300" variant="outline">Disponible</Badge> : <Badge variant="outline">Rupture</Badge>}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" disabled={!d.available || d.stock <= 0} onClick={() => setBuying(d)}><ShoppingCart className="h-3 w-3" /></Button>
                    {isAdmin && <>
                      <Button size="sm" variant="ghost" onClick={() => setEdit(d)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(d.id)}><Trash2 className="h-3 w-3" /></Button>
                    </>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {devices.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucun appareil</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit dialog */}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier appareil" : "Nouvel appareil"}</DialogTitle></DialogHeader>
          {edit && <form onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }} className="space-y-3">
            <div><Label>Nom</Label><Input value={edit.name ?? ""} onChange={e => setEdit({ ...edit, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={edit.device_type} onValueChange={v => setEdit({ ...edit, device_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="capteur_sol">CapteurSol</SelectItem>
                    <SelectItem value="electrovanne">ElectroVanne</SelectItem>
                    <SelectItem value="gateway">Gateway</SelectItem>
                    <SelectItem value="autre">Autre IoT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>État de connexion</Label>
                <Select value={edit.connected_state} onValueChange={v => setEdit({ ...edit, connected_state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connecte">Connecté</SelectItem>
                    <SelectItem value="non_connecte">Non connecté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prix (DT)</Label><Input type="number" step="0.01" value={edit.price_dt ?? 0} onChange={e => setEdit({ ...edit, price_dt: +e.target.value })} required /></div>
              <div><Label>Stock</Label><Input type="number" value={edit.stock ?? 0} onChange={e => setEdit({ ...edit, stock: +e.target.value })} /></div>
            </div>
            <div><Label>Informations techniques</Label><Textarea value={edit.info ?? ""} onChange={e => setEdit({ ...edit, info: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-2"><Switch checked={edit.available ?? true} onCheckedChange={v => setEdit({ ...edit, available: v })} /><Label>Disponible à la vente</Label></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEdit(null)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
          </form>}
        </DialogContent>
      </Dialog>

      {/* Buy dialog */}
      <BuyDeviceDialog device={buying} onClose={() => setBuying(null)} profiles={profiles} />
    </Card>
  );
}

function BuyDeviceDialog({ device, onClose, profiles }: { device: Device | null; onClose: () => void; profiles: any[] }) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [buyer, setBuyer] = useState<string>(profile?.id ?? "");
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState("carte");
  const [code, setCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const VERIFY_CODE = "1234";

  useEffect(() => { if (device) { setBuyer(profile?.id ?? ""); setQty(1); setMethod("carte"); setCode(""); setConfirmed(false); } }, [device, profile]);

  const buy = useMutation({
    mutationFn: async () => {
      if (!device) return null;
      const total = qty * device.price_dt;
      const { error } = await supabase.from("device_sales").insert({
        device_id: device.id, buyer_profile_id: buyer, quantity: qty,
        unit_price_dt: device.price_dt, total_dt: total, payment_method: method, status: "en_attente",
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sales"] }); toast({ title: "Commande créée", description: "En attente de validation admin." }); onClose(); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (!device) return null;
  const total = qty * device.price_dt;
  const canSubmit = buyer && qty > 0 && code === VERIFY_CODE && confirmed;

  return (
    <Dialog open={!!device} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Acheter {device.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/40 text-sm"><b>Prix unitaire :</b> {DT(device.price_dt)} • <b>Stock :</b> {device.stock}</div>
          <div><Label>Acheteur</Label>
            <Select value={buyer} onValueChange={setBuyer}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
              <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.email}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantité</Label><Input type="number" min={1} max={device.stock} value={qty} onChange={e => setQty(+e.target.value)} /></div>
            <div><Label>Méthode</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{METHOD_LABEL[m]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground">Total à payer</p>
            <p className="text-2xl font-bold text-primary">{DT(total)}</p>
          </div>
          <div><Label>Code de vérification (1234)</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="Entrez le code" /></div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />Je confirme la commande sous validation ADMIN/SOUS-ADMIN.</label>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Annuler</Button><Button disabled={!canSubmit || buy.isPending} onClick={() => buy.mutate()}>Payer en 1 clic</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============== SALES (validation) ============== */
function SalesTab({ sales, devById, profById, isAdmin, userId }: { sales: Sale[]; devById: Record<string, Device>; profById: Record<string, any>; isAdmin: boolean; userId?: string }) {
  const qc = useQueryClient();
  const validate = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("device_sales").update({ status, validated_by: userId, validated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sales"] }); toast({ title: "Mise à jour" }); },
  });

  return (
    <Card><CardHeader><CardTitle className="text-base">Ventes appareils</CardTitle></CardHeader><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Date</TableHead><TableHead>Acheteur</TableHead><TableHead>Appareil</TableHead><TableHead>Qté</TableHead><TableHead>Total</TableHead><TableHead>Méthode</TableHead><TableHead>Statut</TableHead>{isAdmin && <TableHead>Actions</TableHead>}
        </TableRow></TableHeader>
        <TableBody>
          {sales.map(s => {
            const buyer = profById[s.buyer_profile_id];
            const dev = devById[s.device_id];
            return (
              <TableRow key={s.id}>
                <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>{buyer ? `${buyer.first_name} ${buyer.last_name}` : "—"}</TableCell>
                <TableCell>{dev?.name ?? "—"}</TableCell>
                <TableCell>{s.quantity}</TableCell>
                <TableCell className="font-semibold">{DT(s.total_dt)}</TableCell>
                <TableCell className="text-xs">{METHOD_LABEL[s.payment_method] ?? s.payment_method}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={s.status === "valide" ? "bg-emerald-500/15 text-emerald-700 border-emerald-300" : s.status === "refuse" ? "bg-red-500/15 text-red-700 border-red-300" : "bg-orange-500/15 text-orange-700 border-orange-300"}>{s.status}</Badge>
                </TableCell>
                {isAdmin && <TableCell>
                  {s.status === "en_attente" && <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => validate.mutate({ id: s.id, status: "valide" })}><CheckCircle2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => validate.mutate({ id: s.id, status: "refuse" })}><XCircle className="h-4 w-4" /></Button>
                  </div>}
                </TableCell>}
              </TableRow>
            );
          })}
          {sales.length === 0 && <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">Aucune vente</TableCell></TableRow>}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

/* ============== PLANS ============== */
function PlansTab({ plans, isAdmin, profiles }: { plans: Plan[]; isAdmin: boolean; profiles: any[] }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Partial<Plan> | null>(null);
  const [subscribing, setSubscribing] = useState<Plan | null>(null);

  const save = useMutation({
    mutationFn: async (p: Partial<Plan>) => {
      const payload: any = { ...p };
      if (typeof payload.features === "string") payload.features = (payload.features as string).split(",").map((s: string) => s.trim()).filter(Boolean);
      if (p.id) return (await supabase.from("subscription_plans").update(payload).eq("id", p.id)).error;
      return (await supabase.from("subscription_plans").insert(payload)).error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); setEdit(null); toast({ title: "Plan enregistré" }); },
  });
  const del = useMutation({ mutationFn: async (id: string) => (await supabase.from("subscription_plans").delete().eq("id", id)).error, onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); } });

  return (
    <Card><CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-base">Plans d'abonnement</CardTitle>
      {isAdmin && <Button size="sm" onClick={() => setEdit({ name: "", price_dt: 0, duration_days: 30, features: [], active: true })}><Plus className="h-4 w-4 mr-1" />Nouveau plan</Button>}
    </CardHeader><CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => (
          <Card key={p.id} className="border-2 hover:border-primary/40 transition">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{p.name}</h3>
                {p.active ? <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300" variant="outline">Actif</Badge> : <Badge variant="outline">Inactif</Badge>}
              </div>
              <div><span className="text-3xl font-bold text-primary">{DT(p.price_dt)}</span><span className="text-sm text-muted-foreground"> / {p.duration_days}j</span></div>
              <ul className="text-sm space-y-1">{(p.features || []).map((f, i) => <li key={i}>✓ {f}</li>)}</ul>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => setSubscribing(p)}>Souscrire</Button>
                {isAdmin && <>
                  <Button size="sm" variant="ghost" onClick={() => setEdit({ ...p, features: (p.features || []).join(", ") as any })}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(p.id)}><Trash2 className="h-3 w-3" /></Button>
                </>}
              </div>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && <p className="text-muted-foreground text-center col-span-3 py-8">Aucun plan</p>}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier plan" : "Nouveau plan"}</DialogTitle></DialogHeader>
          {edit && <form onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }} className="space-y-3">
            <div><Label>Nom</Label><Input value={edit.name ?? ""} onChange={e => setEdit({ ...edit, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prix (DT)</Label><Input type="number" step="0.01" value={edit.price_dt ?? 0} onChange={e => setEdit({ ...edit, price_dt: +e.target.value })} required /></div>
              <div><Label>Durée (jours)</Label><Input type="number" value={edit.duration_days ?? 30} onChange={e => setEdit({ ...edit, duration_days: +e.target.value })} required /></div>
            </div>
            <div><Label>Fonctionnalités (séparées par virgule)</Label><Input value={(edit.features as any) ?? ""} onChange={e => setEdit({ ...edit, features: e.target.value as any })} /></div>
            <div className="flex items-center gap-2"><Switch checked={edit.active ?? true} onCheckedChange={v => setEdit({ ...edit, active: v })} /><Label>Actif</Label></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEdit(null)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
          </form>}
        </DialogContent>
      </Dialog>

      <SubscribeDialog plan={subscribing} onClose={() => setSubscribing(null)} profiles={profiles} />
    </CardContent></Card>
  );
}

function SubscribeDialog({ plan, onClose, profiles }: { plan: Plan | null; onClose: () => void; profiles: any[] }) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [buyer, setBuyer] = useState(profile?.id ?? "");
  const [method, setMethod] = useState("carte");
  const [code, setCode] = useState("");
  const VERIFY_CODE = "1234";

  useEffect(() => { if (plan) { setBuyer(profile?.id ?? ""); setMethod("carte"); setCode(""); } }, [plan, profile]);

  const sub = useMutation({
    mutationFn: async () => {
      if (!plan) return;
      const start = new Date();
      const end = new Date(); end.setDate(end.getDate() + plan.duration_days);
      const { error } = await supabase.from("subscription_payments").insert({
        profile_id: buyer, plan_id: plan.id, amount_dt: plan.price_dt, payment_method: method,
        status: "en_attente", date_start: start.toISOString().slice(0, 10), date_exp: end.toISOString().slice(0, 10),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subpays"] }); toast({ title: "Demande envoyée", description: "En attente de validation." }); onClose(); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (!plan) return null;
  const canSubmit = buyer && code === VERIFY_CODE;
  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Souscrire — {plan.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border-2 border-primary/30 text-center">
            <p className="text-3xl font-bold text-primary">{DT(plan.price_dt)}</p>
            <p className="text-xs text-muted-foreground">pour {plan.duration_days} jours</p>
          </div>
          <div><Label>Utilisateur</Label>
            <Select value={buyer} onValueChange={setBuyer}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Méthode</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{METHOD_LABEL[m]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Code de vérification (1234)</Label><Input value={code} onChange={e => setCode(e.target.value)} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Annuler</Button><Button disabled={!canSubmit || sub.isPending} onClick={() => sub.mutate()}>Confirmer en 1 clic</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============== SUB PAYMENTS ============== */
function SubPaysTab({ subpays, planById, profById, isAdmin, userId }: { subpays: SubPay[]; planById: Record<string, Plan>; profById: Record<string, any>; isAdmin: boolean; userId?: string }) {
  const qc = useQueryClient();
  const validate = useMutation({
    mutationFn: async ({ s, status }: { s: SubPay; status: string }) => {
      const { error } = await supabase.from("subscription_payments").update({ status, validated_by: userId, validated_at: new Date().toISOString() }).eq("id", s.id);
      if (error) throw error;
      if (status === "valide") {
        await supabase.from("profiles").update({ date_deb_abo: s.date_start, date_exp_abo: s.date_exp }).eq("id", s.profile_id);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subpays"] }); qc.invalidateQueries({ queryKey: ["profiles"] }); toast({ title: "Mise à jour" }); },
  });
  return (
    <Card><CardHeader><CardTitle className="text-base">Paiements d'abonnement</CardTitle></CardHeader><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Date</TableHead><TableHead>Utilisateur</TableHead><TableHead>Plan</TableHead><TableHead>Montant</TableHead><TableHead>Méthode</TableHead><TableHead>Expire</TableHead><TableHead>Statut</TableHead>{isAdmin && <TableHead>Actions</TableHead>}
        </TableRow></TableHeader>
        <TableBody>
          {subpays.map(s => {
            const u = profById[s.profile_id]; const p = planById[s.plan_id];
            return <TableRow key={s.id}>
              <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>{u ? `${u.first_name} ${u.last_name}` : "—"}</TableCell>
              <TableCell>{p?.name ?? "—"}</TableCell>
              <TableCell className="font-semibold">{DT(s.amount_dt)}</TableCell>
              <TableCell className="text-xs">{METHOD_LABEL[s.payment_method] ?? s.payment_method}</TableCell>
              <TableCell className="text-xs">{s.date_exp ?? "—"}</TableCell>
              <TableCell><Badge variant="outline" className={s.status === "valide" ? "bg-emerald-500/15 text-emerald-700 border-emerald-300" : s.status === "refuse" ? "bg-red-500/15 text-red-700 border-red-300" : "bg-orange-500/15 text-orange-700 border-orange-300"}>{s.status}</Badge></TableCell>
              {isAdmin && <TableCell>{s.status === "en_attente" && <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => validate.mutate({ s, status: "valide" })}><CheckCircle2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => validate.mutate({ s, status: "refuse" })}><XCircle className="h-4 w-4" /></Button>
              </div>}</TableCell>}
            </TableRow>;
          })}
          {subpays.length === 0 && <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">Aucun paiement</TableCell></TableRow>}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}
