import { Cpu, Info, MapPin } from "lucide-react"
import { Card } from "../ui/card"

interface SpecItem {
  label: string
  value: string
}

interface ResourceSpecsCardProps {
  displayImage: string
  displayTitle: string
  displayCode: string
  specs: SpecItem[]
  displayRoom: string
  displayDept: string
  specializare: string
  userRole?: string
}

export function ResourceSpecsCard({
  displayImage,
  displayTitle,
  displayCode,
  specs,
  displayRoom,
  displayDept,
  specializare,
  userRole,
}: ResourceSpecsCardProps) {
  const roleAccountText =
    userRole === "PROFESOR"
      ? "profesor"
      : userRole === "RESPONSABIL_LABORATOR"
      ? "reprezentant laborator"
      : userRole === "ADMINISTRATOR"
      ? "administrator"
      : "student"

  return (
    <div className="lg:col-span-4 space-y-5">
      <Card className="rounded-2xl border-neutral-200 bg-white overflow-hidden shadow-none">
        <div className="h-56 w-full bg-neutral-950 overflow-hidden">
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="px-4 py-2.5 bg-white border-t border-neutral-100 text-[11px] text-neutral-400 font-mono">
          {displayCode}
        </div>
      </Card>

      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Cpu className="h-4 w-4 text-neutral-800" />
          <h2 className="text-sm font-bold text-neutral-900">Specificații tehnice</h2>
        </div>

        <div className="space-y-2.5 text-xs pb-3.5 border-b border-neutral-100">
          {specs.map((sp) => (
            <div key={sp.label} className="flex items-center justify-between">
              <span className="text-neutral-500">{sp.label}</span>
              <span className="font-bold text-neutral-900">{sp.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 text-xs pb-3.5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-neutral-500">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              Laborator
            </span>
            <span className="font-bold text-neutral-900">{displayRoom}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Departament</span>
            <span className="font-bold text-neutral-900">{displayDept}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Specializare</span>
            <span className="font-bold text-neutral-900">{specializare}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span>Cotă max. 4 rezervări simultane pe cont {roleAccountText}.</span>
        </div>
      </Card>
    </div>
  )
}
