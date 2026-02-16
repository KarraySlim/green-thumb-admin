export interface Country {
  code: string;
  name: string;
  dialCode: string;
  cities: string[];
}

export const countries: Country[] = [
  { code: "TN", name: "Tunisie", dialCode: "+216", cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa", "Monastir", "Ben Arous", "Kasserine", "Médenine", "Nabeul", "Tataouine", "Béja", "Jendouba", "Mahdia", "Sidi Bouzid", "Kef", "Tozeur", "Manouba", "Siliana", "Zaghouan", "Kébili"] },
  { code: "FR", name: "France", dialCode: "+33", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"] },
  { code: "DZ", name: "Algérie", dialCode: "+213", cities: ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif", "Djelfa", "Biskra", "Tlemcen"] },
  { code: "MA", name: "Maroc", dialCode: "+212", cities: ["Casablanca", "Rabat", "Fès", "Marrakech", "Tanger", "Meknès", "Oujda", "Kénitra", "Agadir", "Tétouan"] },
  { code: "LY", name: "Libye", dialCode: "+218", cities: ["Tripoli", "Benghazi", "Misrata", "Zawiya", "Zliten"] },
  { code: "EG", name: "Égypte", dialCode: "+20", cities: ["Le Caire", "Alexandrie", "Gizeh", "Louxor", "Assouan"] },
  { code: "SA", name: "Arabie Saoudite", dialCode: "+966", cities: ["Riyad", "Djeddah", "La Mecque", "Médine", "Dammam"] },
  { code: "AE", name: "Émirats arabes unis", dialCode: "+971", cities: ["Dubaï", "Abu Dhabi", "Charjah", "Ajman"] },
  { code: "US", name: "États-Unis", dialCode: "+1", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"] },
  { code: "DE", name: "Allemagne", dialCode: "+49", cities: ["Berlin", "Munich", "Hambourg", "Francfort", "Cologne"] },
  { code: "IT", name: "Italie", dialCode: "+39", cities: ["Rome", "Milan", "Naples", "Turin", "Florence"] },
  { code: "ES", name: "Espagne", dialCode: "+34", cities: ["Madrid", "Barcelone", "Valence", "Séville", "Saragosse"] },
  { code: "TR", name: "Turquie", dialCode: "+90", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"] },
];
