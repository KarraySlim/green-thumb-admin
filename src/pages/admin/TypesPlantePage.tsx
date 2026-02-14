import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTypesPlante, createTypePlante, deleteTypePlante } from "@/services/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function TypesPlantePage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["types-plante"], queryFn: getTypesPlante });

  const createMut = useMutation({
    mutationFn: createTypePlante,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["types-plante"] }); setShowForm(false); toast({ title: "Type de plante créé" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteTypePlante,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["types-plante"] }); toast({ title: "Type de plante supprimé" }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      nomPlante: fd.get("nomPlante") as string,
      typePlante: fd.get("typePlante") as string,
      besoinEauParPlante: parseFloat(fd.get("besoinEau") as string),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Types de plante</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouveau type</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouveau type de plante</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Nom plante</Label><Input name="nomPlante" required /></div>
              <div><Label>Type</Label><Input name="typePlante" required /></div>
              <div><Label>Besoin eau (L)</Label><Input name="besoinEau" type="number" step="0.1" required /></div>
              <div className="md:col-span-3"><Button type="submit" disabled={createMut.isPending}>Créer</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Besoin eau (L)</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.nomPlante}</TableCell><TableCell>{t.typePlante}</TableCell>
                  <TableCell>{t.besoinEauParPlante}</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(t.id)} itemName={t.nomPlante} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Aucun type</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
