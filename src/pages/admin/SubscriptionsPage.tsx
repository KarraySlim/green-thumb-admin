import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, updateClient } from "@/services/data-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, CreditCard, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Client } from "@/types/models";

const aboTypes = [
  { value: "op1", label: "Option 1" },
  { value: "op1_op2", label: "Option 1 + 2" },
  { value: "full", label: "Full Options" },
] as const;

export default function SubscriptionsPage() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const [editing, setEditing] = useState<Client | null>(null);

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setEditing(null); toast({ title: t("sub.updated") }); },
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => updateClient(id, { dateDebAbo: undefined, dateExpAbo: undefined, typeAbo: undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast({ title: t("sub.removed") }); },
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!editing) return;
    updateMut.mutate({
      id: editing.id,
      data: {
        dateDebAbo: fd.get("dateDebAbo") as string || undefined,
        dateExpAbo: fd.get("dateExpAbo") as string || undefined,
        typeAbo: (fd.get("typeAbo") as Client["typeAbo"]) || undefined,
      },
    });
  };

  const getStatus = (client: Client) => {
    if (!client.dateExpAbo) return { label: t("sub.noSub"), variant: "outline" as const };
    const diff = Math.ceil((new Date(client.dateExpAbo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return { label: t("sub.expired"), variant: "destructive" as const };
    return { label: `${diff} ${t("sub.daysLeft")}`, variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t("nav.subscriptions")}</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("users.title")}</TableHead>
                <TableHead>{t("sub.type")}</TableHead>
                <TableHead>{t("sub.start")}</TableHead>
                <TableHead>{t("sub.end")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="w-24">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => {
                const status = getStatus(c);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                    <TableCell>{c.typeAbo ? t(`sub.${c.typeAbo}`) : "—"}</TableCell>
                    <TableCell>{c.dateDebAbo ?? "—"}</TableCell>
                    <TableCell>{c.dateExpAbo ?? "—"}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(c)}><Pencil className="h-3 w-3" /></Button>
                        {c.typeAbo && (
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeMut.mutate(c.id)}><Trash2 className="h-3 w-3" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle><CreditCard className="inline mr-2 h-5 w-5" />{editing?.firstName} {editing?.lastName}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>{t("sub.type")}</Label>
              <Select name="typeAbo" defaultValue={editing?.typeAbo ?? ""}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {aboTypes.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("sub.start")}</Label><Input name="dateDebAbo" type="date" defaultValue={editing?.dateDebAbo ?? ""} /></div>
              <div><Label>{t("sub.end")}</Label><Input name="dateExpAbo" type="date" defaultValue={editing?.dateExpAbo ?? ""} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
              <Button type="submit">{t("common.save")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
