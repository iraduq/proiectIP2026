import { Globe, Mail, MapPin, Pencil, Phone, Power, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Institution } from "../../types"

interface InstitutionsGridProps {
  institutions: Institution[]
  isLoading: boolean
  isAdmin: boolean
  onEdit: (inst: Institution) => void
  onToggle: (inst: Institution) => void
  onDelete: (inst: Institution) => void
}

export function InstitutionsGrid({
  institutions,
  isLoading,
  isAdmin,
  onEdit,
  onToggle,
  onDelete,
}: InstitutionsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="col-span-3 py-12 text-center text-neutral-400 text-xs">
          Se încarcă instituțiile...
        </div>
      ) : institutions.length === 0 ? (
        <div className="col-span-3 py-12 text-center text-neutral-400 text-xs">
          Nicio instituție găsită.
        </div>
      ) : (
        institutions.map((inst) => (
          <Card
            key={inst.id}
            className="rounded-2xl border-neutral-200 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs font-bold px-2 py-0.5">
                  {inst.cod}
                </Badge>
                <Badge variant={inst.is_active ? "success" : "secondary"}>
                  {inst.is_active ? "Activă" : "Inactivă"}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-base text-neutral-900 leading-snug">{inst.nume}</h3>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span>
                    {inst.oras}, {inst.adresa}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                {inst.email_contact && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-neutral-400" />
                    <span>{inst.email_contact}</span>
                  </div>
                )}
                {inst.telefon && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-neutral-400" />
                    <span>{inst.telefon}</span>
                  </div>
                )}
                {inst.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-neutral-400" />
                    <a
                      href={inst.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-800 hover:underline truncate"
                    >
                      {inst.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>

            {isAdmin && (
              <div className="px-6 py-3 bg-neutral-50/60 border-t border-neutral-100 flex items-center justify-end gap-2 rounded-b-2xl">
                <button
                  onClick={() => onEdit(inst)}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded"
                  title="Editează instituția"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onToggle(inst)}
                  className={`p-1.5 rounded ${
                    inst.is_active
                      ? "text-amber-600 hover:bg-amber-100/60"
                      : "text-emerald-600 hover:bg-emerald-100/60"
                  }`}
                  title={inst.is_active ? "Dezactivează instituția" : "Activează instituția"}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(inst)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Șterge instituția"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  )
}
