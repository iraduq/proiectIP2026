import { AlertCircle, CheckCircle2 } from "lucide-react"

interface BookingStatusNoticeProps {
  hasSlotConflict: boolean
  formattedSelectedRange: string
  activeCount: number
  maxLimit: number
}

export function BookingStatusNotice({
  hasSlotConflict,
  formattedSelectedRange,
  activeCount,
  maxLimit,
}: BookingStatusNoticeProps) {
  return (
    <>
      {hasSlotConflict ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-800">
              Interval indisponibil: suprapunere cu un slot ocupat
            </p>
            <p className="text-rose-700 text-[11px] mt-0.5">
              Intervalul {formattedSelectedRange} conține ore deja rezervate. Alege alt interval liber.
            </p>
          </div>
        </div>
      ) : activeCount < maxLimit ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-800">
              Cotă disponibilă: {activeCount} rezervări active din max. {maxLimit}
            </p>
            <p className="text-emerald-700 text-[11px] mt-0.5">
              Poți adăuga această rezervare fără a depăși limita simultană.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-900">
              Limită cotă atinsă: {activeCount} / {maxLimit} resurse simultane
            </p>
            <p className="text-amber-700 text-[11px] mt-0.5">
              Ai atins plafonul maxim de 4 resurse simultan.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
