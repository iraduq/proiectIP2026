import { Plus } from "lucide-react"
import { ALL_CATALOG_ITEMS } from "../../data/catalogItems"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

interface RoomsHeroCardProps {
  roomsCount: number
  canEdit: boolean
  onCreateClick: () => void
}

export function RoomsHeroCard({ roomsCount, canEdit, onCreateClick }: RoomsHeroCardProps) {
  const stats = [
    {
      label: "Laboratoare active",
      value: `${roomsCount} săli`,
      hint: "În Corpul Electro (Aripile A, B, C)",
    },
    {
      label: "Program standard acces",
      value: "08:00 – 20:00",
      hint: "Luni – Vineri (Card student / Rezervare)",
    },
    {
      label: "Echipamente găzduite",
      value: `${ALL_CATALOG_ITEMS.length} resurse`,
      hint: "Distribuite în sălile de laborator",
    },
    {
      label: "Punct predare / ridicare",
      value: "La sala indicată",
      hint: "Pe baza rezervării din platformă",
    },
  ]

  return (
    <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5">
              Localizare campus
            </Badge>
            <span className="text-xs text-neutral-500 font-medium">
              Corp Electro · Bd. Vasile Pârvan nr. 2
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Laboratoare și săli de cercetare
          </h1>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Caută rapid unde se află un laborator în campus (aripă, etaj, indicații de orientare),
            verifică programul de acces, cadrul didactic responsabil și ce echipamente poți rezerva
            în fiecare sală.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={onCreateClick}
            className="rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white h-9 px-4 text-xs font-semibold gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Adaugă laborator
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-neutral-100">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-3"
          >
            <div className="text-[11px] text-neutral-500 font-medium">{stat.label}</div>
            <div className="text-lg font-bold text-neutral-900 mt-0.5">{stat.value}</div>
            <div className="text-[10px] text-neutral-400">{stat.hint}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
