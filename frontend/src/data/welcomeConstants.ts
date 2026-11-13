import { Activity, Bot, CircuitBoard, Cpu, Printer } from "lucide-react"
import {
  IotKitVisual,
  OscilloscopeVisual,
  Printer3DVisual,
  RobotArmVisual,
  WorkstationVisual,
} from "../components/welcome/WelcomeVisuals"

export const WELCOME_CATEGORIES = [
  {
    title: "Calculatoare AI",
    desc: "Stații de lucru pentru AI și calcul intensiv",
    icon: Cpu,
    visual: WorkstationVisual,
    catId: 1,
  },
  {
    title: "Roboți",
    desc: "Brațe robotice pentru proiecte practice",
    icon: Bot,
    visual: RobotArmVisual,
    catId: 2,
  },
  {
    title: "Kituri IoT",
    desc: "Seturi embedded și dezvoltare IoT",
    icon: CircuitBoard,
    visual: IotKitVisual,
    catId: 4,
  },
  {
    title: "Osciloscoape",
    desc: "Instrumente de măsurare și analiză",
    icon: Activity,
    visual: OscilloscopeVisual,
    catId: 3,
  },
  {
    title: "Imprimante 3D",
    desc: "Prototipare rapidă cu filament FDM",
    icon: Printer,
    visual: Printer3DVisual,
    catId: 5,
  },
] as const

export const WELCOME_STEPS = [
  {
    step: 1,
    title: "Autentifică-te",
    description: "Accesul la rezervare necesită un cont instituțional.",
  },
  {
    step: 2,
    title: "Alege resursa și intervalul",
    description: "Caută în catalog și verifică disponibilitatea.",
  },
  {
    step: 3,
    title: "Rezervă și urmărești",
    description: "Gestionează rezervările din panoul personal.",
  },
] as const
