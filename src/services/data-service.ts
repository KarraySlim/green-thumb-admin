import { Client, TypePlante, Surface, Plante, Vanne } from "@/types/models";
import { clients, typesPlante, surfaces, plantes, vannes } from "./mock-data";

// Helper
const uuid = () => crypto.randomUUID();

// ─── Clients ────────────────────────────────────────
export const getClients = async (): Promise<Client[]> => [...clients];

export const createClient = async (data: Omit<Client, "id">): Promise<Client> => {
  const c: Client = { id: uuid(), ...data };
  clients.push(c);
  return c;
};

export const deleteClient = async (id: string): Promise<void> => {
  const idx = clients.findIndex((c) => c.id === id);
  if (idx !== -1) clients.splice(idx, 1);
};

// ─── Types Plante ───────────────────────────────────
export const getTypesPlante = async (): Promise<TypePlante[]> => [...typesPlante];

export const createTypePlante = async (data: Omit<TypePlante, "id">): Promise<TypePlante> => {
  const t: TypePlante = { id: uuid(), ...data };
  typesPlante.push(t);
  return t;
};

export const deleteTypePlante = async (id: string): Promise<void> => {
  const idx = typesPlante.findIndex((t) => t.id === id);
  if (idx !== -1) typesPlante.splice(idx, 1);
};

// ─── Surfaces ───────────────────────────────────────
export const getSurfaces = async (): Promise<Surface[]> => {
  return surfaces.map((s) => ({
    ...s,
    clientEmail: clients.find((c) => c.id === s.fkClient)?.email ?? "—",
    nbVanne: vannes.filter((v) => v.fkSurface === s.id).length,
  }));
};

export const createSurface = async (data: Omit<Surface, "id" | "nbVanne" | "clientEmail">): Promise<Surface> => {
  const s: Surface = { id: uuid(), nbVanne: 0, clientEmail: clients.find((c) => c.id === data.fkClient)?.email, ...data };
  surfaces.push(s);
  return s;
};

export const deleteSurface = async (id: string): Promise<void> => {
  // cascade
  for (let i = plantes.length - 1; i >= 0; i--) if (plantes[i].fkSurface === id) plantes.splice(i, 1);
  for (let i = vannes.length - 1; i >= 0; i--) if (vannes[i].fkSurface === id) vannes.splice(i, 1);
  const idx = surfaces.findIndex((s) => s.id === id);
  if (idx !== -1) surfaces.splice(idx, 1);
};

// ─── Plantes ────────────────────────────────────────
export const getPlantes = async (): Promise<Plante[]> => {
  return plantes.map((p) => ({
    ...p,
    surfaceNom: surfaces.find((s) => s.id === p.fkSurface)?.nomSurface ?? "—",
    typePlanteNom: typesPlante.find((t) => t.id === p.fkTypePlante)?.nomPlante ?? "—",
  }));
};

export const createPlante = async (data: Omit<Plante, "id" | "surfaceNom" | "typePlanteNom">): Promise<Plante> => {
  const p: Plante = {
    id: uuid(),
    ...data,
    surfaceNom: surfaces.find((s) => s.id === data.fkSurface)?.nomSurface,
    typePlanteNom: typesPlante.find((t) => t.id === data.fkTypePlante)?.nomPlante,
  };
  plantes.push(p);
  return p;
};

export const deletePlante = async (id: string): Promise<void> => {
  const idx = plantes.findIndex((p) => p.id === id);
  if (idx !== -1) plantes.splice(idx, 1);
};

// ─── Vannes ─────────────────────────────────────────
export const getVannes = async (): Promise<Vanne[]> => {
  return vannes.map((v) => ({
    ...v,
    surfaceNom: surfaces.find((s) => s.id === v.fkSurface)?.nomSurface ?? "—",
  }));
};

export const createVanne = async (data: Omit<Vanne, "id" | "surfaceNom">): Promise<Vanne> => {
  const v: Vanne = {
    id: uuid(),
    ...data,
    surfaceNom: surfaces.find((s) => s.id === data.fkSurface)?.nomSurface,
  };
  vannes.push(v);
  // recalculate nb_vanne
  const surf = surfaces.find((s) => s.id === data.fkSurface);
  if (surf) surf.nbVanne = vannes.filter((vn) => vn.fkSurface === surf.id).length;
  return v;
};

export const deleteVanne = async (id: string): Promise<void> => {
  const vanne = vannes.find((v) => v.id === id);
  const idx = vannes.findIndex((v) => v.id === id);
  if (idx !== -1) vannes.splice(idx, 1);
  // recalculate
  if (vanne) {
    const surf = surfaces.find((s) => s.id === vanne.fkSurface);
    if (surf) surf.nbVanne = vannes.filter((vn) => vn.fkSurface === surf.id).length;
  }
};
