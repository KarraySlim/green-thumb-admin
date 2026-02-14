import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSols, createSol, deleteSol } from "@/services/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function SolsPage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["sols"], queryFn: getSols });

  const createMut = useMutation({
    mutationFn: createSol,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sols"] }); setShowForm(false); toast({ title: "Sol créé" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSol,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sols"] }); toast({ title: "Sol supprimé" }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      nature: fd.get("nature") as string,
      humidite: parseFloat(fd.get("humidite") as string),
      salinite: parseFloat(fd.get("salinite") as string),
      ph: parseFloat(fd.get("ph") as string),
      temperature: parseFloat(fd.get("temperature") as string),
      dateMesure: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Sols</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Annuler</> : <><Plus className="mr-2 h-4 w-4" />Nouveau sol</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nouveau sol</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Nature</Label><Input name="nature" required /></div>
              <div><Label>Humidité (%)</Label><Input name="humidite" type="number" step="0.1" required /></div>
              <div><Label>Salinité</Label><Input name="salinite" type="number" step="0.01" required /></div>
              <div><Label>pH</Label><Input name="ph" type="number" step="0.1" min="0" max="14" required /></div>
              <div><Label>Température (°C)</Label><Input name="temperature" type="number" step="0.1" required /></div>
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
                <TableHead>Nature</TableHead><TableHead>Humidité</TableHead><TableHead>Salinité</TableHead>
                <TableHead>pH</TableHead><TableHead>Température</TableHead><TableHead>Date mesure</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.nature}</TableCell><TableCell>{s.humidite}%</TableCell>
                  <TableCell>{s.salinite}</TableCell><TableCell>{s.ph}</TableCell>
                  <TableCell>{s.temperature}°C</TableCell>
                  <TableCell>{new Date(s.dateMesure).toLocaleDateString()}</TableCell>
                  <TableCell><DeleteDialog onConfirm={() => deleteMut.mutate(s.id)} itemName={s.nature} /></TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Aucun sol</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
