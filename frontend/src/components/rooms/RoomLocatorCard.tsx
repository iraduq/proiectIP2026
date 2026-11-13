import {
  Edit2,
  MapPin,
  Users,
  Building2,
  Clock,
  UserCheck,
  Cpu,
  Navigation,
  ChevronRight,
  Layers,
  CheckCircle2,
} from "lucide-react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import type { Room } from "../../types"
import type { LabLocationMeta } from "../../data/roomLocations"
import type { CatalogCardItem } from "../../data/catalogItems"

interface RoomLocatorCardProps {
  room: Room
  meta: LabLocationMeta
  floorText: string
  equipmentInRoom: CatalogCardItem[]
  deptName: string
  facCode: string
  canEdit: boolean
  isExpanded: boolean
  onToggleExpand: (roomId: number) => void
  onEdit: (room: Room) => void
  onSelectEquipment: (resourceId: number) => void
  onBrowseResources: () => void
}

export function RoomLocatorCard({
  room,
  meta,
  floorText,
  equipmentInRoom,
  deptName,
  facCode,
  canEdit,
  isExpanded,
  onToggleExpand,
  onEdit,
  onSelectEquipment,
  onBrowseResources,
}: RoomLocatorCardProps) {
  const previewEquipment = isExpanded ? equipmentInRoom : equipmentInRoom.slice(0, 4)

  return (
    <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-lg bg-neutral-950 text-white text-xs font-bold px-2.5 py-0.5">
                {meta.shortCode}
              </Badge>
              <span className="font-mono text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                {room.cod}
              </span>
              <Badge
                variant="outline"
                className="rounded-full bg-emerald-50 border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 gap-1"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Deschis accesului
              </Badge>
            </div>
            <h2 className="text-base font-bold text-neutral-900 leading-snug pt-1">
              {room.nume}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>
                Facultatea {facCode} · {deptName}
              </span>
            </div>
          </div>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(room)}
              className="h-8 px-2.5 rounded-lg border-neutral-200 text-xs text-neutral-700 shrink-0 gap-1"
            >
              <Edit2 className="h-3 w-3" />
              Editează
            </Button>
          )}
        </div>

        <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <Navigation className="h-3.5 w-3.5 text-neutral-800" />
              <span>Unde se află laboratorul și cum ajungi:</span>
            </div>
            <Badge
              variant="outline"
              className="rounded-md bg-white border-neutral-200 text-neutral-800 text-[11px] font-semibold"
            >
              <MapPin className="h-3 w-3 mr-1 text-neutral-500" />
              {floorText}
            </Badge>
          </div>

          <div className="text-xs text-neutral-700 font-medium">
            {meta.building} — <span className="font-bold text-neutral-900">{meta.wing}</span>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed bg-white rounded-lg p-2.5 border border-neutral-200/60">
            {meta.directions}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{meta.schedule}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <UserCheck className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="truncate" title={meta.coordinatorEmail}>
                {meta.coordinator}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>Capacitate: {room.capacitate || 24} locuri</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
              <Cpu className="h-3.5 w-3.5 text-neutral-600" />
              <span>
                Echipamente în {meta.shortCode} ({equipmentInRoom.length} resurse)
              </span>
            </div>
            {equipmentInRoom.length > 4 && (
              <button
                type="button"
                onClick={() => onToggleExpand(room.id)}
                className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950"
              >
                {isExpanded ? "Restrânge lista" : `Vezi toate (${equipmentInRoom.length})`}
              </button>
            )}
          </div>

          {previewEquipment.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {previewEquipment.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectEquipment(item.id)}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-900 p-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-8 w-8 rounded-lg object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-neutral-900 truncate group-hover:underline">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">{item.code}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-900 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-neutral-400 italic">
              {room.descriere || "Sală dotată cu stații de lucru și infrastructură de cercetare."}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-neutral-500">{meta.accessNote}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onBrowseResources}
          className="h-8 px-3 rounded-xl border-neutral-200 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 shrink-0 gap-1"
        >
          <Layers className="h-3.5 w-3.5" />
          Rezervă echipament din sală
        </Button>
      </div>
    </Card>
  )
}
