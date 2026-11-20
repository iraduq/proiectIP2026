import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import type { ResourcePayload } from "../../../api/resources"
import type { Category, Resource, Room, StareTehnica } from "../../../types"
import { STARE_LABELS } from "../data/adminDemoData"

interface ResourceEditorPanelProps {
  resource: Resource | null
  categories: Category[]
  rooms: Room[]
  onSave: (id: number | null, data: ResourcePayload) => Promise<void>
  onReset: () => void
}

const EMPTY: ResourcePayload = {
  nume: "",
  cod_inventar: "",
  categorie_id: 0,
  sala_id: 0,
  descriere: "",
  specificatii: "",
  stare_tehnica: "DISPONIBILA",
}

export function ResourceEditorPanel({ resource, categories, rooms, onSave, onReset }: ResourceEditorPanelProps) {
  const [form, setForm] = useState<ResourcePayload>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    setForm(
      resource
        ? {
            nume: resource.nume,
            cod_inventar: resource.cod_inventar,
            categorie_id: resource.categorie_id,
            sala_id: resource.sala_id,
            descriere: resource.descriere ?? "",
            specificatii: resource.specificatii ?? "",
            stare_tehnica: resource.stare_tehnica,
          }
        : EMPTY
    )
  }, [resource])

  const set = <K extends keyof ResourcePayload>(key: K, value: ResourcePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nume || !form.cod_inventar || !form.categorie_id || !form.sala_id) {
      setError("Completează denumirea, codul, categoria și sala.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(resource?.id ?? null, form)
      onReset()
    } catch {
      setError("Salvarea a eșuat. Verifică datele introduse.")
    } finally {
      setSaving(false)
    }
  }

  const selectClass = "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm"

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-neutral-950">
        {resource ? "Editare resursă" : "Creare resursă"}
      </h2>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Denumire</span>
        <Input value={form.nume} onChange={(e) => set("nume", e.target.value)} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Cod inventar</span>
        <Input value={form.cod_inventar} onChange={(e) => set("cod_inventar", e.target.value)} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Categorie</span>
        <select className={selectClass} value={form.categorie_id} onChange={(e) => set("categorie_id", Number(e.target.value))}>
          <option value={0}>Alege categoria</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nume}</option>)}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Laborator / sală</span>
        <select className={selectClass} value={form.sala_id} onChange={(e) => set("sala_id", Number(e.target.value))}>
          <option value={0}>Alege sala</option>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.cod} · {r.nume}</option>)}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Stare tehnică</span>
        <select className={selectClass} value={form.stare_tehnica} onChange={(e) => set("stare_tehnica", e.target.value as StareTehnica)}>
          {Object.entries(STARE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Specificații</span>
        <Input value={form.specificatii ?? ""} onChange={(e) => set("specificatii", e.target.value)} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Descriere</span>
        <Textarea value={form.descriere ?? ""} onChange={(e) => set("descriere", e.target.value)} rows={3} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? "Se salvează..." : "Salvează resursa"}
        </Button>
        {resource && <Button type="button" variant="outline" onClick={onReset}>Resursă nouă</Button>}
      </div>
      <p className="text-xs text-neutral-500">
        Dezactivarea păstrează istoricul complet al resursei. Ștergerea fizică nu este disponibilă.
      </p>
    </form>
  )
}
