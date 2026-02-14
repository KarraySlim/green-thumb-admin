export interface Client {
  id: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  location: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface TypePlante {
  id: string;
  nomPlante: string;
  typePlante: string;
  besoinEauParPlante: number;
}

export interface Climat {
  id: string;
  temperatureC: number;
  humiditeC: number;
  vitesseVent: number;
  puissanceEnsoleillement: number;
}

export interface Sol {
  id: string;
  nature: string;
  humidite: number;
  salinite: number;
  ph: number;
  temperature: number;
  dateMesure: string;
}

export interface Surface {
  id: string;
  nomSurface: string;
  localisation: string;
  nbVanne: number;
  typeSol?: string;
  fkClient: string;
  fkSol?: string;
  fkClimat?: string;
  // joined
  clientEmail?: string;
}

export interface Plante {
  id: string;
  nomPlante: string;
  age: number;
  fkTypePlante: string;
  fkSurface: string;
  // joined
  surfaceNom?: string;
  typePlanteNom?: string;
}

export interface Vanne {
  id: string;
  nomVanne: string;
  nbPlantParVanne: number;
  debitEauParVanne: number;
  fkSurface: string;
  // joined
  surfaceNom?: string;
}
