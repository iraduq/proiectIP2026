import { Calendar, Info } from "lucide-react"

const AUTH_HIGHLIGHT_STEPS = [
  { num: "01", text: "Explorează catalogul de resurse" },
  { num: "02", text: "Alege un interval disponibil" },
  { num: "03", text: "Urmărește rezervările tale" },
] as const

export function AuthBrandingPanel() {
  return (
    <div className="lg:col-span-5 bg-[#fafafa] border-b lg:border-b-0 lg:border-r border-neutral-200/70 lg:rounded-r-3xl p-8 lg:p-10 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-bold tracking-tight">
            RRM
          </span>
          <span className="font-bold text-neutral-900 text-base tracking-tight">RRM</span>
        </div>
      </div>

      <div className="my-auto py-8 space-y-5">
        <div className="text-[11px] uppercase tracking-wider font-medium text-neutral-500 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-neutral-400" />
          <span>SPAȚIUL TĂU DE LABORATOR</span>
        </div>

        <h1 className="text-2xl lg:text-[28px] font-bold text-neutral-900 leading-snug tracking-tight">
          De la resursa potrivită
          <br />
          la următorul proiect.
        </h1>

        <p className="text-neutral-500 text-xs leading-relaxed max-w-sm">
          Găsește echipamente, verifică disponibilitatea și organizează rezervările într-un singur
          loc.
        </p>

        <div className="p-3 rounded-2xl border border-neutral-200/80 bg-[#f5f5f5]/70 space-y-2.5 max-w-sm">
          {AUTH_HIGHLIGHT_STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-neutral-900 text-white px-4 py-3.5 rounded-xl flex items-center gap-3 text-xs font-medium"
            >
              <span className="text-neutral-400 font-mono text-[11px]">{step.num}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-neutral-400 flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span>Resource Research Manager · Acces conform rolului instituțional</span>
      </div>
    </div>
  )
}
