import { Client, TypePlante, Sol, Climat, Surface, Plante, Vanne } from "@/types/models";

const CLIENT_ID = "c1000000-0000-0000-0000-000000000001";
const CLIENT_ID2 = "c1000000-0000-0000-0000-000000000002";
const TYPE_PLANTE_ID = "tp100000-0000-0000-0000-000000000001";
const SOL_ID = "s1000000-0000-0000-0000-000000000001";
const CLIMAT_ID = "cl100000-0000-0000-0000-000000000001";
const SURFACE_ID = "sf100000-0000-0000-0000-000000000001";
const SURFACE_ID2 = "sf100000-0000-0000-0000-000000000002";
const PLANTE_ID = "pl100000-0000-0000-0000-000000000001";
const VANNE_ID = "vn100000-0000-0000-0000-000000000001";

export const clients: Client[] = [
  {
    id: CLIENT_ID,
    email: "admin@local.test",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "System",
    phoneNumber: "+21600000000",
    dateOfBirth: "1990-01-01",
    location: "Tunis, Tunisie",
    country: "TN",
    city: "Tunis",
    dateDebAbo: "2025-01-01",
    dateExpAbo: "2026-06-01",
    typeAbo: "full",
  },
  {
    id: CLIENT_ID2,
    email: "client@test.tn",
    role: "CLIENT",
    firstName: "Ahmed",
    lastName: "Ben Ali",
    phoneNumber: "+21655123456",
    dateOfBirth: "1985-05-15",
    location: "Sfax, Tunisie",
    country: "TN",
    city: "Sfax",
    dateDebAbo: "2025-06-01",
    dateExpAbo: "2025-12-01",
    typeAbo: "op1",
  },
];

export const typesPlante: TypePlante[] = [
  { id: TYPE_PLANTE_ID, nomPlante: "Olivier", typePlante: "Arbre fruitier", besoinEauParPlante: 2.5 },
];

export const sols: Sol[] = [
  { id: SOL_ID, nature: "Argileux", humidite: 45, salinite: 0.3, ph: 6.8, temperature: 18, dateMesure: new Date().toISOString() },
];

export const climats: Climat[] = [
  { id: CLIMAT_ID, temperatureC: 22, humiditeC: 55, vitesseVent: 12, puissanceEnsoleillement: 800 },
];

export const surfaces: Surface[] = [
  {
    id: SURFACE_ID,
    nomSurface: "Parcelle A",
    localisation: "Zone Nord",
    nbVanne: 1,
    typeSol: "Argileux",
    fkClient: CLIENT_ID,
    fkSol: SOL_ID,
    fkClimat: CLIMAT_ID,
    clientEmail: "admin@local.test",
  },
  {
    id: SURFACE_ID2,
    nomSurface: "Parcelle B",
    localisation: "Zone Sud",
    nbVanne: 0,
    typeSol: "Sableux",
    fkClient: CLIENT_ID2,
    clientEmail: "client@test.tn",
  },
];

export const plantes: Plante[] = [
  {
    id: PLANTE_ID,
    nomPlante: "Olivier-01",
    age: 5,
    fkTypePlante: TYPE_PLANTE_ID,
    fkSurface: SURFACE_ID,
    surfaceNom: "Parcelle A",
    typePlanteNom: "Olivier",
  },
];

export const vannes: Vanne[] = [
  {
    id: VANNE_ID,
    nomVanne: "Vanne-A1",
    nbPlantParVanne: 10,
    debitEauParVanne: 3.5,
    fkSurface: SURFACE_ID,
    surfaceNom: "Parcelle A",
  },
];
