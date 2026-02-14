import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, createClient, deleteClient } from "@/services/data-service";
import { Client } from "@/types/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });

  const createMut = useMutation({
    mutationFn: createClient,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setShowForm(false); toast({ title: "Client créé" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast({ title: "Client supprimé" }); },
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
        <h2 className="text-2xl font-bold text-foreground">Clients</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouveau client</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouveau client</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Email</Label><Input name="email" type="email" required /></div>
              <div><Label>Prénom</Label><Input name="firstName" required /></div>
              <div><Label>Nom</Label><Input name="lastName" required /></div>
              <div>
                <Label>Rôle</Label>
                <Select name="role" defaultValue="CLIENT">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="CLIENT">Client</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Téléphone</Label><Input name="phoneNumber" /></div>
              <div><Label>Date de naissance</Label><Input name="dateOfBirth" type="date" /></div>
              <div><Label>Localisation</Label><Input name="location" /></div>
              <div className="md:col-span-2"><Button type="submit" disabled={createMut.isPending}>Créer</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead><TableHead>Prénom</TableHead><TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead><TableHead>Téléphone</TableHead><TableHead>Localisation</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.email}</TableCell><TableCell>{c.firstName}</TableCell><TableCell>{c.lastName}</TableCell>
                  <TableCell>{c.role}</TableCell><TableCell>{c.phoneNumber}</TableCell><TableCell>{c.location}</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(c.id)} itemName={c.email} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Aucun client</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
