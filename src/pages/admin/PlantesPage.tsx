import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlantes, createPlante, deletePlante, getSurfaces, getTypesPlante } from "@/services/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function PlantesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["plantes"], queryFn: getPlantes });
  const { data: surfacesList = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: typesList = [] } = useQuery({ queryKey: ["types-plante"], queryFn: getTypesPlante });

  const createMut = useMutation({
    mutationFn: createPlante,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plantes"] }); setShowForm(false); toast({ title: "Plante créée" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deletePlante,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plantes"] }); toast({ title: "Plante supprimée" }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      nomPlante: fd.get("nomPlante") as string,
      age: parseInt(fd.get("age") as string),
      fkSurface: selectedSurface,
      fkTypePlante: selectedType,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Plantes</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouvelle plante</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouvelle plante</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nom</Label><Input name="nomPlante" required /></div>
              <div><Label>Âge (ans)</Label><Input name="age" type="number" min="0" required /></div>
              <div>
                <Label>Surface</Label>
                <Select value={selectedSurface} onValueChange={setSelectedSurface}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une surface" /></SelectTrigger>
                  <SelectContent>
                    {surfacesList.map((s) => <SelectItem key={s.id} value={s.id}>{s.nomSurface}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type de plante</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                  <SelectContent>
                    {typesList.map((t) => <SelectItem key={t.id} value={t.id}>{t.nomPlante}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Button type="submit" disabled={createMut.isPending || !selectedSurface || !selectedType}>Créer</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead><TableHead>Âge</TableHead><TableHead>Surface</TableHead>
                <TableHead>Type plante</TableHead><TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nomPlante}</TableCell><TableCell>{p.age} ans</TableCell>
                  <TableCell>{p.surfaceNom}</TableCell><TableCell>{p.typePlanteNom}</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(p.id)} itemName={p.nomPlante} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune plante</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
