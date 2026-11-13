import { AlertTriangle, Calendar, MapPin } from "lucide-react"
import type { CatalogCardItem } from "../../data/catalogItems"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

interface ResourceCatalogCardProps {
  item: CatalogCardItem
  onOpenDetail: (id: number) => void
  onSelectCategory: (category: string) => void
  onSelectDepartment: (department: string) => void
  onSelectRoom: (room: string) => void
}

export function ResourceCatalogCard({
  item,
  onOpenDetail,
  onSelectCategory,
  onSelectDepartment,
  onSelectRoom,
}: ResourceCatalogCardProps) {
  return (
    <Card className="rounded-2xl border-neutral-200 bg-white overflow-hidden shadow-none hover:border-neutral-400 transition-colors flex flex-col justify-between">
      <div>
        <div
          onClick={() => onOpenDetail(item.id)}
          className="h-44 w-full bg-neutral-100 overflow-hidden cursor-pointer relative group"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5">
            <span
              onClick={(e) => {
                e.stopPropagation()
                onSelectCategory(item.categoryTag)
              }}
              className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold cursor-pointer hover:bg-black"
            >
              {item.categoryTag}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-neutral-400 font-mono">
              {item.code}
            </span>

            {item.statusBadge === "În utilizare" ? (
              <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                În utilizare
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="rounded-full bg-neutral-50 border-neutral-200 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5"
              >
                {item.statusBadge}
              </Badge>
            )}
          </div>

          <div onClick={() => onOpenDetail(item.id)} className="cursor-pointer">
            <h3 className="text-sm font-bold text-neutral-900 leading-snug hover:underline">
              {item.name}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {item.specsAndRoom}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <Badge
              variant="outline"
              onClick={() => onSelectDepartment(item.department)}
              className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5 cursor-pointer hover:bg-neutral-200"
            >
              {item.department}
            </Badge>

            <Badge
              variant="outline"
              onClick={() => onSelectRoom(item.roomLabel)}
              className="rounded-full bg-neutral-50 border-neutral-200 text-neutral-600 text-[10px] font-medium px-2 py-0.5 cursor-pointer hover:bg-neutral-100 gap-1"
            >
              <MapPin className="h-2.5 w-2.5 text-neutral-400" />
              {item.roomLabel}
            </Badge>

            {item.returnTodayBadge && (
              <Badge
                variant="outline"
                className="rounded-full bg-amber-50 border-amber-200 text-amber-800 text-[10px] font-semibold px-2.5 py-0.5 gap-1"
              >
                <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
                {item.returnTodayBadge}
              </Badge>
            )}
          </div>

          {item.availabilityNote && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-0.5">
              <Calendar className="h-3 w-3 text-neutral-400 shrink-0" />
              <span>{item.availabilityNote}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        <Button
          variant="outline"
          onClick={() => onOpenDetail(item.id)}
          className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-950 hover:text-white text-neutral-900 text-xs font-semibold transition-colors"
        >
          Rezervă pe ore sau zile
        </Button>
      </div>
    </Card>
  )
}
