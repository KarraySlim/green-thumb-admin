import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVannes, createVanne, deleteVanne, getSurfaces } from "@/services/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function VannesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["vannes"], queryFn: getVannes });
  const { data: surfacesList = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });

  const createMut = useMutation({
    mutationFn: createVanne,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vannes"] });
      qc.invalidateQueries({ queryKey: ["surfaces"] });
      setShowForm(false);
      toast({ title: "Vanne créée" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteVanne,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vannes"] });
      qc.invalidateQueries({ queryKey: ["surfaces"] });
      toast({ title: "Vanne supprimée" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      nomVanne: fd.get("nomVanne") as string,
      debitEauParVanne: parseFloat(fd.get("debit") as string),
      nbPlantParVanne: parseInt(fd.get("nbPlant") as string),
      fkSurface: selectedSurface,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Vannes</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouvelle vanne</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouvelle vanne</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nom vanne</Label><Input name="nomVanne" required /></div>
              <div><Label>Débit eau (L/h)</Label><Input name="debit" type="number" step="0.1" required /></div>
              <div><Label>Nb plantes par vanne</Label><Input name="nbPlant" type="number" min="0" required /></div>
              <div>
                <Label>Surface</Label>
                <Select value={selectedSurface} onValueChange={setSelectedSurface}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une surface" /></SelectTrigger>
                  <SelectContent>
                    {surfacesList.map((s) => <SelectItem key={s.id} value={s.id}>{s.nomSurface}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Button type="submit" disabled={createMut.isPending || !selectedSurface}>Créer</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead><TableHead>Débit (L/h)</TableHead><TableHead>Nb plantes</TableHead>
                <TableHead>Surface</TableHead><TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.nomVanne}</TableCell><TableCell>{v.debitEauParVanne}</TableCell>
                  <TableCell>{v.nbPlantParVanne}</TableCell><TableCell>{v.surfaceNom}</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(v.id)} itemName={v.nomVanne} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune vanne</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
