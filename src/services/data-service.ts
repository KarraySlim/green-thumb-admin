import { Client, TypePlante, Surface, Plante, Vanne, Sol, Climat } from "@/types/models";
import { clients, typesPlante, surfaces, plantes, vannes, sols, climats } from "./mock-data";

// Helper
const uuid = () => crypto.randomUUID();

// ─── Clients ────────────────────────────────────────
export const getClients = async (): Promise<Client[]> => [...clients];

export const createClient = async (data: Omit<Client, "id">): Promise<Client> => {
  const c: Client = { id: uuid(), ...data };
  clients.push(c);
  return c;
};

export const updateClient = async (id: string, data: Partial<Client>): Promise<Client | null> => {
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...data };
  return clients[idx];
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

export const updateSurface = async (id: string, data: Partial<Surface>): Promise<Surface | null> => {
  const idx = surfaces.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  surfaces[idx] = { ...surfaces[idx], ...data };
  return surfaces[idx];
};

export const deleteSurface = async (id: string): Promise<void> => {
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
  const surf = surfaces.find((s) => s.id === data.fkSurface);
  if (surf) surf.nbVanne = vannes.filter((vn) => vn.fkSurface === surf.id).length;
  return v;
};

export const deleteVanne = async (id: string): Promise<void> => {
  const vanne = vannes.find((v) => v.id === id);
  const idx = vannes.findIndex((v) => v.id === id);
  if (idx !== -1) vannes.splice(idx, 1);
  if (vanne) {
    const surf = surfaces.find((s) => s.id === vanne.fkSurface);
    if (surf) surf.nbVanne = vannes.filter((vn) => vn.fkSurface === surf.id).length;
  }
};

// ─── Sols ───────────────────────────────────────────
export const getSols = async (): Promise<Sol[]> => [...sols];

export const createSol = async (data: Omit<Sol, "id">): Promise<Sol> => {
  const s: Sol = { id: uuid(), ...data };
  sols.push(s);
  return s;
};

export const deleteSol = async (id: string): Promise<void> => {
  const idx = sols.findIndex((s) => s.id === id);
  if (idx !== -1) sols.splice(idx, 1);
};

// ─── Climats ────────────────────────────────────────
export const getClimats = async (): Promise<Climat[]> => [...climats];

export const createClimat = async (data: Omit<Climat, "id">): Promise<Climat> => {
  const c: Climat = { id: uuid(), ...data };
  climats.push(c);
  return c;
};

export const deleteClimat = async (id: string): Promise<void> => {
  const idx = climats.findIndex((c) => c.id === id);
  if (idx !== -1) climats.splice(idx, 1);
};

// ─── Update functions ──────────────────────────────
export const updateTypePlante = async (id: string, data: Partial<TypePlante>): Promise<TypePlante | null> => {
  const idx = typesPlante.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  typesPlante[idx] = { ...typesPlante[idx], ...data };
  return typesPlante[idx];
};

export const updatePlante = async (id: string, data: Partial<Plante>): Promise<Plante | null> => {
  const idx = plantes.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  plantes[idx] = { ...plantes[idx], ...data };
  return plantes[idx];
};

export const updateVanne = async (id: string, data: Partial<Vanne>): Promise<Vanne | null> => {
  const idx = vannes.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  vannes[idx] = { ...vannes[idx], ...data };
  return vannes[idx];
};

export const updateSol = async (id: string, data: Partial<Sol>): Promise<Sol | null> => {
  const idx = sols.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  sols[idx] = { ...sols[idx], ...data };
  return sols[idx];
};

export const updateClimat = async (id: string, data: Partial<Climat>): Promise<Climat | null> => {
  const idx = climats.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  climats[idx] = { ...climats[idx], ...data };
  return climats[idx];
};
