import { Info, LayoutDashboard, Plus } from "lucide-react"
import { JOURNAL_FORM_ID } from "../data/labConstants"
import { Pill } from "./LabUi"

interface Props {
  labName: string
  department: string
  faculty: string
}

export function LabHeader({ labName, department, faculty }: Props) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-[14px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-neutral-900" />
            <h1 className="text-2xl font-semibold text-neutral-950">
              Responsabil laborator{labName ? ` · ${labName}` : ""}
            </h1>
            {department && <Pill tone="neutral">{department}</Pill>}
          </div>
          <p className="text-sm text-neutral-500">
            Gestionezi predarea, returul și starea tehnică. Cererile studenților sunt afișate în contextul facultății.
          </p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById(JOURNAL_FORM_ID)?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[10px] bg-neutral-900 px-2.5 text-sm font-medium text-neutral-50 shadow-sm hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" /> Intrare nouă jurnal
        </button>
      </div>
      <div className="rounded-[10px] border border-neutral-200 bg-white px-2.5 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-950">
          <Info className="h-4 w-4" />
          Context curent: {labName || "—"}{faculty ? ` · ${faculty}` : ""}
        </div>
        <p className="mt-0.5 pl-6 text-sm font-light text-neutral-950">
          Profesorii și responsabilii de laborator aprobă sau resping motivat cererile și înregistrează predarea / returul.
          Filtrul {labName || "laboratorului"} nu reprezintă un rol de acces separat.
        </p>
      </div>
    </>
  )
}
