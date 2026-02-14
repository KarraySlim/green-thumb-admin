import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClimats, createClimat, deleteClimat } from "@/services/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function ClimatsPage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["climats"], queryFn: getClimats });

  const createMut = useMutation({
    mutationFn: createClimat,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["climats"] }); setShowForm(false); toast({ title: "Climat créé" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteClimat,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["climats"] }); toast({ title: "Climat supprimé" }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      temperatureC: parseFloat(fd.get("temperatureC") as string),
      humiditeC: parseFloat(fd.get("humiditeC") as string),
      vitesseVent: parseFloat(fd.get("vitesseVent") as string),
      puissanceEnsoleillement: parseFloat(fd.get("puissanceEnsoleillement") as string),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Climats</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouveau climat</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouveau climat</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Température (°C)</Label><Input name="temperatureC" type="number" step="0.1" required /></div>
              <div><Label>Humidité (%)</Label><Input name="humiditeC" type="number" step="0.1" required /></div>
              <div><Label>Vitesse vent (km/h)</Label><Input name="vitesseVent" type="number" step="0.1" required /></div>
              <div><Label>Puissance ensoleillement (W/m²)</Label><Input name="puissanceEnsoleillement" type="number" step="1" required /></div>
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
                <TableHead>Température</TableHead><TableHead>Humidité</TableHead>
                <TableHead>Vitesse vent</TableHead><TableHead>Ensoleillement</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.temperatureC}°C</TableCell><TableCell>{c.humiditeC}%</TableCell>
                  <TableCell>{c.vitesseVent} km/h</TableCell><TableCell>{c.puissanceEnsoleillement} W/m²</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(c.id)} itemName={`Climat ${c.temperatureC}°C`} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun climat</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
