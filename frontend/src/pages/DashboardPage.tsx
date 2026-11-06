import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { academicApi } from "../api/academic"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import type { Resource, Reservation, Room, StudentQuota } from "../types"
import {
  DoorOpen,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Calendar,
  Wrench,
  Clock,
  Sparkles,
} from "lucide-react"

export function DashboardPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [quota, setQuota] = useState<StudentQuota | null>(null)

  const [totalRooms, setTotalRooms] = useState(0)
  const [totalResources, setTotalResources] = useState(0)
  const [totalReservations, setTotalReservations] = useState(0)
  const [totalFaculties, setTotalFaculties] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const isStudent = user?.rol === "STUDENT"
  const isAdmin = user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [roomsData, facultiesData, resData, reservData] = await Promise.all([
          academicApi.getRooms({ limit: 5 }),
          academicApi.getFaculties({ limit: 1 }),
          resourcesApi.getResources({ limit: 5 }),
          reservationsApi.getReservations({ limit: 5 }),
        ])

        setRooms(roomsData.items)
        setTotalRooms(roomsData.total)
        setTotalFaculties(facultiesData.total)

        setResources(resData.items)
        setTotalResources(resData.total)

        setReservations(reservData.items)
        setTotalReservations(reservData.total)

        if (isStudent) {
          try {
            const q = await reservationsApi.getMyQuota()
            setQuota(q)
          } catch {}
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboardData()
  }, [isStudent])

  const hasValidMatricol =
    isStudent &&
    Boolean(user?.numar_matricol) &&
    user?.numar_matricol !== "string" &&
    user?.numar_matricol !== "0"

  const hasValidAngajat =
    !isStudent &&
    Boolean(user?.id_angajat) &&
    Number(user?.id_angajat) > 0

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Panou de bord"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                Bună, bine ai revenit{user?.nume ? `, ${user.nume}` : ""}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
                {user?.rol}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {isAdmin
                ? "Panou centralizat de administrare a resurselor universitare, rezervărilor și structurii academice."
                : "Platformă unificată pentru consultarea echipamentelor de laborator și gestionarea rezervărilor."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/resources">
              <Button className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm">
                <Cpu className="h-4 w-4" />
                <span>Catalog Echipamente</span>
              </Button>
            </Link>
            <Link to="/reservations">
              <Button variant="outline" className="text-xs font-semibold h-10 px-4 rounded-xl flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Rezervări</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-neutral-200 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="text-xs font-medium text-neutral-500">Echipamente & Resurse</div>
              <div className="text-3xl font-extrabold text-neutral-900">{totalResources}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-neutral-500" />
                <span>În inventarul universității</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="text-xs font-medium text-neutral-500">Săli & Laboratoare</div>
              <div className="text-3xl font-extrabold text-neutral-900">{totalRooms}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <DoorOpen className="h-3 w-3 text-neutral-500" />
                <span>Spații didactice și cercetare</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="text-xs font-medium text-neutral-500">Total Rezervări</div>
              <div className="text-3xl font-extrabold text-neutral-900">{totalReservations}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-500" />
                <span>Înregistrate în sistem</span>
              </div>
            </CardContent>
          </Card>

          {isStudent ? (
            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-medium text-neutral-500">Cota Ta de Rezervare</div>
                <div className="text-3xl font-extrabold text-neutral-900">
                  {quota?.active_count ?? 0} / 4
                </div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{4 - (quota?.active_count ?? 0)} locuri libere disponibile</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-medium text-neutral-500">Privilegii de acces</div>
                <div className="text-2xl font-extrabold text-neutral-900">
                  {isAdmin ? "Administrator" : user?.rol}
                </div>
                <div className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Aprobare & mentenanță activă</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Catalog Preview */}
            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-neutral-700" />
                    Echipamente de cercetare disponibile
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Cele mai recente resurse adăugate în laborator</p>
                </div>
                <Link
                  to="/resources"
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  <span>Vezi toate ({totalResources})</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                    <tr>
                      <th className="py-3 px-5">Cod</th>
                      <th className="py-3 px-5">Echipament</th>
                      <th className="py-3 px-5">Categorie</th>
                      <th className="py-3 px-5">Sală</th>
                      <th className="py-3 px-5">Stare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-400">
                          Se încarcă echipamentele...
                        </td>
                      </tr>
                    ) : resources.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-400">
                          Nu există resurse înregistrate.
                        </td>
                      </tr>
                    ) : (
                      resources.map((res) => (
                        <tr key={res.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3 px-5 font-mono font-bold text-neutral-900">{res.cod_inventar}</td>
                          <td className="py-3 px-5 font-medium text-neutral-800">{res.nume}</td>
                          <td className="py-3 px-5 text-neutral-500">{res.categorie_nume}</td>
                          <td className="py-3 px-5 text-neutral-600">{res.sala_cod}</td>
                          <td className="py-3 px-5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                res.stare_tehnica === "DISPONIBILA"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : res.stare_tehnica === "IN_MENTENANTA"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {res.stare_tehnica}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Reservations Preview */}
            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-700" />
                    Rezervări recente
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Ultimele cereri de împrumut procesate</p>
                </div>
                <Link
                  to="/reservations"
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  <span>Gestiune rezervări</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                    <tr>
                      <th className="py-3 px-5">Resursă</th>
                      <th className="py-3 px-5">Utilizator</th>
                      <th className="py-3 px-5">Interval</th>
                      <th className="py-3 px-5">Stare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-neutral-400">
                          Se încarcă rezervările...
                        </td>
                      </tr>
                    ) : reservations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-neutral-400">
                          Nu există rezervări înregistrate.
                        </td>
                      </tr>
                    ) : (
                      reservations.map((r) => (
                        <tr key={r.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3 px-5">
                            <div className="font-bold text-neutral-900">{r.resursa_nume}</div>
                            <div className="text-[10px] font-mono text-neutral-500">{r.resursa_cod}</div>
                          </td>
                          <td className="py-3 px-5 text-neutral-700 font-medium">{r.utilizator_nume}</td>
                          <td className="py-3 px-5 text-neutral-500">
                            {new Date(r.data_inceput).toLocaleDateString("ro-RO")}
                          </td>
                          <td className="py-3 px-5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.stare === "APROBATA"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : r.stare === "IN_ASTEPTARE"
                                  ? "bg-amber-50 text-amber-700"
                                  : r.stare === "FINALIZATA"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {r.stare}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column (1 col): Profile, Info, Quick Links */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <div className="p-5 border-b border-neutral-100">
                <h3 className="font-bold text-sm text-neutral-900">Profil & Apartenență Academică</h3>
              </div>
              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <div className="text-neutral-400 text-[11px]">Nume complet</div>
                  <div className="font-semibold text-neutral-800 text-sm">{user?.nume}</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[11px]">Email instituțional</div>
                  <div className="font-medium text-neutral-700">{user?.email}</div>
                </div>
                {user?.facultate_nume && (
                  <div>
                    <div className="text-neutral-400 text-[11px]">Facultate alocată</div>
                    <div className="font-medium text-neutral-800">{user.facultate_nume}</div>
                  </div>
                )}
                {hasValidMatricol && (
                  <div>
                    <div className="text-neutral-400 text-[11px]">Număr matricol</div>
                    <div className="font-mono font-medium text-neutral-800">{user?.numar_matricol}</div>
                  </div>
                )}
                {hasValidAngajat && (
                  <div>
                    <div className="text-neutral-400 text-[11px]">Identificator angajat</div>
                    <div className="font-mono font-medium text-neutral-800">#{user?.id_angajat}</div>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-100">
                  <div className="text-neutral-400 text-[11px] mb-1.5">Permisiuni active:</div>
                  <div className="flex flex-wrap gap-1">
                    {user?.permissions?.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono text-[10px]"
                      >
                        {p}
                      </span>
                    ))}
                    {(user?.permissions?.length || 0) > 5 && (
                      <span className="text-[10px] text-neutral-400 self-center">
                        +{(user?.permissions?.length || 0) - 5} altele
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Navigation Cards */}
            <div className="space-y-3">
              <Link to="/resources" className="block">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-black transition-all shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-neutral-900">Catalog Echipamente</div>
                      <div className="text-[11px] text-neutral-500">Rezervă kituri & calculatoare</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>

              <Link to="/reservations" className="block">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-black transition-all shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-neutral-900">Gestiune Rezervări</div>
                      <div className="text-[11px] text-neutral-500">Vezi cereri și stări active</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>

              <Link to="/technical-history" className="block">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-black transition-all shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-neutral-900">Jurnal Tehnic</div>
                      <div className="text-[11px] text-neutral-500">Istoric mentenanță & defecțiuni</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>

              <Link to="/rooms" className="block">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-black transition-all shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                      <DoorOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-neutral-900">Săli de cercetare</div>
                      <div className="text-[11px] text-neutral-500">Laboratoare pe departamente</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
export default DashboardPage
