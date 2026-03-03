import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Pencil, CheckCircle, Clock, Search } from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  user_role?: string;
}

export default function UsersPage() {
  const { t } = useLanguage();
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  // Fetch all auth users via security definer function
  const { data: authUsers = [] } = useQuery<AuthUser[]>({
    queryKey: ["auth-users"],
    queryFn: async () => {
      const { data: users, error } = await supabase.rpc("get_all_auth_users");
      if (error) throw error;

      // Fetch roles from profiles
      const { data: profiles } = await supabase.from("profiles").select("user_id, user_role");
      const roleMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.user_role]));

      return (users ?? []).map((u: any) => ({
        ...u,
        user_role: roleMap.get(u.id) || "CLIENT",
      }));
    },
  });

  const updateRoleMut = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ user_role: role } as any)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-users"] });
      setEditing(null);
      toast({ title: "Rôle mis à jour" });
    },
  });

  const filtered = authUsers.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Admin</Badge>;
      case "SOUS_ADMIN":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Sous-admin</Badge>;
      default:
        return <Badge variant="secondary">Client</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("users.title")}</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("auth.email")}</TableHead>
                <TableHead>{t("auth.firstName")}</TableHead>
                <TableHead>{t("auth.lastName")}</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Email vérifié</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="w-16">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.first_name || "—"}</TableCell>
                  <TableCell>{u.last_name || "—"}</TableCell>
                  <TableCell>{getRoleBadge(u.user_role ?? "CLIENT")}</TableCell>
                  <TableCell>
                    {u.email_confirmed_at ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Vérifié</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">En attente</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(u)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t("users.noUser")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Utilisateur</Label>
              <p className="text-sm text-muted-foreground">{editing?.email}</p>
            </div>
            <div>
              <Label>Rôle</Label>
              <Select
                defaultValue={editing?.user_role ?? "CLIENT"}
                onValueChange={(val) => {
                  if (editing) {
                    updateRoleMut.mutate({ userId: editing.id, role: val });
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SOUS_ADMIN">Sous-admin</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setEditing(null)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
