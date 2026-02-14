import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClients, getSurfaces, getVannes } from "@/services/data-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Wifi, WifiOff, Droplets, MapPin, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TravailPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: surfaces = [] } = useQuery({ queryKey: ["surfaces"], queryFn: getSurfaces });
  const { data: vannes = [] } = useQuery({ queryKey: ["vannes"], queryFn: getVannes });

  const locations = useMemo(() => {
    const locs = new Set(surfaces.map((s) => s.localisation));
    return Array.from(locs);
  }, [surfaces]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterLocation !== "all") {
        const clientSurfaces = surfaces.filter((s) => s.fkClient === c.id);
        return clientSurfaces.some((s) => s.localisation === filterLocation);
      }

      return true;
    });
  }, [clients, search, filterLocation, surfaces]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Travail</h2>
        <Button onClick={() => navigate("/admin/wizard")}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau projet
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrer par localisation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les localisations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Blocks */}
      <div className="space-y-6">
        {filteredClients.map((client) => {
          const clientSurfaces = surfaces.filter((s) => s.fkClient === client.id);
          const filteredSurfaces = filterLocation !== "all"
            ? clientSurfaces.filter((s) => s.localisation === filterLocation)
            : clientSurfaces;

          return (
            <Card
              key={client.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/travail/client/${client.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">
                    {client.firstName} {client.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Wifi className="mr-1 h-3 w-3" /> Connect
                  </Button>
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive font-medium">Pas connecté</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {filteredSurfaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucune surface configurée</p>
                ) : (
                  <div className="space-y-3">
                    {filteredSurfaces.map((surface) => {
                      const surfaceVannes = vannes.filter((v) => v.fkSurface === surface.id);
                      return (
                        <div
                          key={surface.id}
                          className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-foreground">{surface.nomSurface}</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {surface.localisation}
                            </div>
                            <div className="flex items-center gap-1">
                              <Leaf className="h-3 w-3" /> {surface.nbVanne} plante(s)
                            </div>
                          </div>
                          {/* Vanne mini blocks */}
                          {surfaceVannes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {surfaceVannes.map((v) => (
                                <Badge key={v.id} variant="secondary" className="text-xs">
                                  <Droplets className="mr-1 h-3 w-3" /> {v.nomVanne}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
