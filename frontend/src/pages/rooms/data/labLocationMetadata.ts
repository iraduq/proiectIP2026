export interface LabLocationMeta {
  shortCode: string
  building: string
  wing: string
  directions: string
  schedule: string
  accessNote: string
  coordinator: string
  coordinatorEmail: string
  catalogRoomKey: string
}

export const LAB_LOCATION_METADATA: Record<string, LabLocationMeta> = {
  "UPT-AC-CTI-L1": {
    shortCode: "Lab 204",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Tronson CTI",
    directions:
      "Intrarea principală Corp Electro → Scara B → Etajul 2, culoarul din stânga, a doua ușă pe dreapta (sala B204).",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces pe bază de legitimație student / card RFID sau rezervare activă",
    coordinator: "Prof. dr. ing. Dan Georgescu",
    coordinatorEmail: "dan.georgescu@upt.ro",
    catalogRoomKey: "Lab 204",
  },
  "UPT-AC-CTI-L2": {
    shortCode: "Lab 210",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Tronson CTI",
    directions:
      "Intrarea principală Corp Electro → Scara B → Etajul 2, capătul culoarului spre curtea interioară (sala B210).",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces liber în timpul orelor de laborator sau prin rezervare în platformă",
    coordinator: "Conf. dr. ing. Mihai Radu",
    coordinatorEmail: "mihai.radu@upt.ro",
    catalogRoomKey: "Lab 210",
  },
  "UPT-AC-CTI-S1": {
    shortCode: "Sala Servere",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Subsol Tehnic",
    directions:
      "Coborâre pe Scara B până la Subsol (-1) → Ușa securizată DataCenter (acces asistat de administratorul de rețea).",
    schedule: "24/7 (Acces fizic asistat 08:00 – 18:00)",
    accessNote: "Conectare remote SSH/VPN pentru nodurile GPU; acces fizic cu aprobare",
    coordinator: "Ing. Vlad Munteanu",
    coordinatorEmail: "vlad.munteanu@upt.ro",
    catalogRoomKey: "Sala Servere",
  },
  "UPT-AC-IS-L1": {
    shortCode: "Lab Prototipare",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa A · Parter",
    directions:
      "Intrarea dinspre Parcul Rozelor (Aripa A) → Parter, prima sală pe dreapta lângă atelierul de mecatronică.",
    schedule: "Luni – Vineri · 08:00 – 19:00",
    accessNote: "Instructaj scurt SSM la prima utilizare a imprimantelor 3D / CNC",
    coordinator: "Ș.l. dr. ing. Elena Ionescu",
    coordinatorEmail: "elena.ionescu@upt.ro",
    catalogRoomKey: "Lab Prototipare",
  },
  "UPT-AC-IS-L2": {
    shortCode: "Lab 208",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa A · Etaj 1",
    directions:
      "Scara principală Aripa A → Etajul 1, vizavi de avizierul Departamentului Automatică și Informatică Aplicată.",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces pe bază de rezervare pentru brațele robotice și roverele autonome",
    coordinator: "Prof. dr. ing. Cristian Toma",
    coordinatorEmail: "cristian.toma@upt.ro",
    catalogRoomKey: "Lab 208",
  },
  "UPT-ETcTI-EA-L1": {
    shortCode: "Lab 105",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa C · Etaj 1 (Electronică)",
    directions:
      "Intrarea Aripa C → Etajul 1, a treia sală pe partea stângă (Laborator măsurări și osciloscoape).",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Sondele și kiturile RF se preiau de la tehnicianul sălii 105",
    coordinator: "Conf. dr. ing. Andrei Marin",
    coordinatorEmail: "andrei.marin@upt.ro",
    catalogRoomKey: "Lab 105",
  },
  "UPT-ETcTI-COM-L1": {
    shortCode: "Lab 305",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa C · Etaj 2 (Comunicații)",
    directions:
      "Intrarea Aripa C → Etajul 2, sala C305 lângă laboratorul de rețele optice și radiocomunicații.",
    schedule: "Luni – Vineri · 08:00 – 19:00",
    accessNote: "Echipamentele de fibră optică și analiză spectrală necesită rezervare prealabilă",
    coordinator: "Prof. dr. ing. Sorin Dumitrescu",
    coordinatorEmail: "sorin.dumitrescu@upt.ro",
    catalogRoomKey: "Lab 305",
  },
}
