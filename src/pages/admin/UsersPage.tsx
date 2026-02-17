import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, createClient, updateClient, deleteClient } from "@/services/data-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Client } from "@/types/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Pencil } from "lucide-react";

export default function UsersPage() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });

  const createMut = useMutation({
    mutationFn: createClient,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setShowForm(false); toast({ title: t("users.created") }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setEditing(null); toast({ title: t("users.updated") }); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast({ title: t("users.deleted") }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      email: fd.get("email") as string,
      role: fd.get("role") as "CLIENT" | "ADMIN",
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      phoneNumber: fd.get("phoneNumber") as string,
      dateOfBirth: fd.get("dateOfBirth") as string,
      location: fd.get("location") as string,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("users.title")}</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />{t("common.cancel")}</> : <><Plus className="mr-2 h-4 w-4" />{t("users.newUser")}</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("users.newUser")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>{t("auth.email")}</Label><Input name="email" type="email" required /></div>
              <div><Label>{t("auth.firstName")}</Label><Input name="firstName" required /></div>
              <div><Label>{t("auth.lastName")}</Label><Input name="lastName" required /></div>
              <div>
                <Label>Rôle</Label>
                <Select name="role" defaultValue="CLIENT">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="CLIENT">Client</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>{t("auth.phone")}</Label><Input name="phoneNumber" /></div>
              <div><Label>Date de naissance</Label><Input name="dateOfBirth" type="date" /></div>
              <div><Label>{t("surface.location")}</Label><Input name="location" /></div>
              <div className="md:col-span-2"><Button type="submit" disabled={createMut.isPending}>{t("common.create")}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("auth.email")}</TableHead><TableHead>{t("auth.firstName")}</TableHead><TableHead>{t("auth.lastName")}</TableHead>
                <TableHead>Rôle</TableHead><TableHead>{t("auth.phone")}</TableHead><TableHead>{t("surface.location")}</TableHead>
                <TableHead className="w-24">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.email}</TableCell><TableCell>{c.firstName}</TableCell><TableCell>{c.lastName}</TableCell>
                  <TableCell>{c.role}</TableCell><TableCell>{c.phoneNumber}</TableCell><TableCell>{c.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(c)}><Pencil className="h-3 w-3" /></Button>
                      <DeleteDialog onConfirm={() => deleteMut.mutate(c.id)} itemName={c.email} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("users.noUser")}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("users.editUser")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!editing) return; const fd = new FormData(e.currentTarget); updateMut.mutate({ id: editing.id, data: { firstName: fd.get("firstName") as string, lastName: fd.get("lastName") as string, email: fd.get("email") as string, phoneNumber: fd.get("phoneNumber") as string, location: fd.get("location") as string } }); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("auth.firstName")}</Label><Input name="firstName" defaultValue={editing?.firstName} required /></div>
              <div><Label>{t("auth.lastName")}</Label><Input name="lastName" defaultValue={editing?.lastName} required /></div>
            </div>
            <div><Label>{t("auth.email")}</Label><Input name="email" defaultValue={editing?.email} required /></div>
            <div><Label>{t("auth.phone")}</Label><Input name="phoneNumber" defaultValue={editing?.phoneNumber} /></div>
            <div><Label>{t("surface.location")}</Label><Input name="location" defaultValue={editing?.location} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button><Button type="submit">{t("common.save")}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
