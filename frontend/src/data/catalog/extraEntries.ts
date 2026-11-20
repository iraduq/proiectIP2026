import type { RawSeedEntry } from "./types"
import { IMG_HPC, IMG_ROBOT, IMG_OSC, IMG_IOT } from "./images"

export const EXTRA_WORKSTATIONS_AND_KITS: RawSeedEntry[] = Array.from({ length: 22 }, (_, i) => {
  const num = i + 3
  const idxCode = 119 + i
  const variants = [
    {
      name: `Workstation AI Deep Learning Nr. ${num}`,
      s1L: "GPU",
      s1V: "RTX 4090 24GB",
      s2L: "RAM",
      s2V: "64GB DDR5",
      room: `Lab 20${(i % 4) + 1}`,
      cat: "Calculatoare",
      dept: "Calculatoare",
      spec: "Inteligență Artificială",
      img: IMG_HPC,
    },
    {
      name: `Kit NVIDIA Jetson Orin Nano Nr. ${num}`,
      s1L: "AI",
      s1V: "40 TOPS Ampere",
      s2L: "RAM",
      s2V: "8GB LPDDR5",
      room: "Lab 210",
      cat: "Kituri IoT",
      dept: "Calculatoare",
      spec: "Sisteme Embedded și Edge AI",
      img: IMG_IOT,
    },
    {
      name: `Osciloscop Digital Keysight DSOX Nr. ${num}`,
      s1L: "Bandă",
      s1V: "200 MHz · 4ch",
      s2L: "ADC",
      s2V: "2 GSa/s",
      room: "Lab 105",
      cat: "Instrumente",
      dept: "Electronică",
      spec: "Electronică Aplicată",
      img: IMG_OSC,
    },
    {
      name: `Braț Robotic Didactic Dobot Magician Nr. ${num}`,
      s1L: "Axe",
      s1Value: "4 DOF · 0.2 mm",
      s2L: "Tool",
      s2V: "Gripper + Pen + Vacuum",
      room: "Lab 208",
      cat: "Roboți",
      dept: "Automatică",
      spec: "Robotică Educațională",
      img: IMG_ROBOT,
    },
  ]
  const v = variants[i % variants.length]
  return {
    code: `INV-USV-2026-${String(idxCode).padStart(3, "0")}`,
    name: v.name,
    spec1Label: v.s1L,
    spec1Value: v.s1V || "4 DOF · 0.2 mm",
    spec2Label: v.s2L,
    spec2Value: v.s2V,
    roomLabel: v.room,
    categoryTag: v.cat,
    department: v.dept,
    specializare: v.spec,
    statusBadge: i % 9 === 0 ? "Rezervat" : "Disponibil",
    stareTehnica: "DISPONIBILA",
    availabilityNote: i % 9 === 0 ? "Disponibil: 24.10.2026 · 14:00–16:00" : undefined,
    imageUrl: v.img,
  }
})
