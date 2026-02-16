import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSurfaces, createSurface, deleteSurface, getClients } from "@/services/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";

export default function SurfacesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [localisation, setLocalisation] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: clientsList = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });

  const createMut = useMutation({
    mutationFn: createSurface,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surfaces"] }); setShowForm(false); setSelectedClient(""); setLocalisation(""); toast({ title: "Surface créée" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSurface,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surfaces"] }); toast({ title: "Surface supprimée" }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      nomSurface: fd.get("nomSurface") as string,
      localisation,
      fkClient: selectedClient,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Surfaces</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouvelle surface</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouvelle surface</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Nom surface</Label><Input name="nomSurface" required /></div>
              <div>
                <Label>Localisation</Label>
                <LocationPicker value={localisation} onChange={setLocalisation} placeholder="Choisir localisation" />
              </div>
              <div>
                <Label>Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>
                    {clientsList.map((c) => <SelectItem key={c.id} value={c.id}>{c.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3"><Button type="submit" disabled={createMut.isPending || !selectedClient}>Créer</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead><TableHead>Localisation</TableHead><TableHead>Nb vannes</TableHead>
                <TableHead>Client</TableHead><TableHead>Type sol</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.nomSurface}</TableCell><TableCell>{s.localisation}</TableCell>
                  <TableCell>{s.nbVanne}</TableCell><TableCell>{s.clientEmail}</TableCell>
                  <TableCell>{s.typeSol ?? "—"}</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(s.id)} itemName={s.nomSurface} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucune surface</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
