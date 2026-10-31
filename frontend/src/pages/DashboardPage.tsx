import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { academicApi } from "../api/academic"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import type { Room } from "../types"
import {
  DoorOpen,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
} from "lucide-react"

export function DashboardPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [totalRooms, setTotalRooms] = useState(0)
  const [totalFaculties, setTotalFaculties] = useState(0)
  const [totalDepartments, setTotalDepartments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const isStudent = user?.rol === "STUDENT"
  const isAdmin = user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [roomsData, facultiesData, deptsData] = await Promise.all([
          academicApi.getRooms({ limit: 5 }),
          academicApi.getFaculties({ limit: 1 }),
          academicApi.getDepartments({ limit: 1 }),
        ])
        setRooms(roomsData.items)
        setTotalRooms(roomsData.total)
        setTotalFaculties(facultiesData.total)
        setTotalDepartments(deptsData.total)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Bună, bine ai revenit{user?.nume ? `, ${user.nume}` : ""}!
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              {isAdmin
                ? "Panou de administrare a resurselor academice și a infrastructurii de cercetare"
                : "O privire de ansamblu asupra resurselor academice și accesului tău în sistem"}
            </p>
          </div>
          <Link to="/rooms">
            <Button className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold h-10 px-4 rounded-xl flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              <span>Explorează sălile</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-neutral-200">
            <CardContent className="p-5 space-y-2">
              <div className="text-xs font-medium text-neutral-500">Săli înregistrate</div>
              <div className="text-3xl font-extrabold text-neutral-900">{totalRooms}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <DoorOpen className="h-3 w-3 text-neutral-500" />
                <span>Disponibile în catalog</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200">
            <CardContent className="p-5 space-y-2">
              <div className="text-xs font-medium text-neutral-500">Facultăți active</div>
              <div className="text-3xl font-extrabold text-neutral-900">{totalFaculties}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-neutral-500" />
                <span>În toate universitățile</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200">
            <CardContent className="p-5 space-y-2">
              <div className="text-xs font-medium text-neutral-500">Departamente</div>
              <div className="text-3xl font-extrabold text-neutral-900">{totalDepartments}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Building className="h-3 w-3 text-neutral-500" />
                <span>Unități didactice</span>
              </div>
            </CardContent>
          </Card>

          {isStudent ? (
            <Card className="rounded-2xl border-neutral-200">
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-medium text-neutral-500">Cotă de resurse</div>
                <div className="text-3xl font-extrabold text-neutral-900">0 / 4</div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>4 locuri disponibile</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-neutral-200">
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-medium text-neutral-500">Privilegii de acces</div>
                <div className="text-2xl font-extrabold text-neutral-900">
                  {isAdmin ? "Administrator" : user?.rol || "Cadru Didactic"}
                </div>
                <div className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Control deplin gestiune</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl border-neutral-200">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Săli și Laboratoare de cercetare</h3>
                  <p className="text-xs text-neutral-500">Primele spații disponibile din catalog</p>
                </div>
                <Link
                  to="/rooms"
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  <span>Vezi toate ({totalRooms})</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                    <tr>
                      <th className="py-3 px-5">Cod Sală</th>
                      <th className="py-3 px-5">Denumire</th>
                      <th className="py-3 px-5">Departament</th>
                      <th className="py-3 px-5">Capacitate</th>
                      <th className="py-3 px-5">Stare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-400">
                          Se încarcă sălile din sistem...
                        </td>
                      </tr>
                    ) : rooms.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-400">
                          Nu există săli înregistrate.
                        </td>
                      </tr>
                    ) : (
                      rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3 px-5 font-mono font-semibold text-neutral-900">{room.cod}</td>
                          <td className="py-3 px-5 font-medium text-neutral-800">{room.nume}</td>
                          <td className="py-3 px-5 text-neutral-500 truncate max-w-[180px]">
                            {room.departament_nume}
                          </td>
                          <td className="py-3 px-5 text-neutral-600">{room.capacitate} locuri</td>
                          <td className="py-3 px-5">
                            <Badge variant={room.is_active ? "success" : "secondary"}>
                              {room.is_active ? "Activ" : "Inactiv"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-neutral-200">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900">Profilul tău</h3>
                  <Badge variant="outline" className="capitalize text-xs font-semibold">
                    {user?.rol?.toLowerCase() || "utilizator"}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Nume:</span>
                    <span className="font-semibold text-neutral-800">{user?.nume}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Email:</span>
                    <span className="font-semibold text-neutral-800">{user?.email}</span>
                  </div>

                  {isStudent && user?.facultate_nume && (
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Facultate:</span>
                      <span className="font-semibold text-neutral-800 text-right max-w-[160px] truncate" title={user.facultate_nume}>
                        {user.facultate_nume} ({user.facultate_cod})
                      </span>
                    </div>
                  )}

                  {hasValidMatricol && (
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Număr matricol:</span>
                      <span className="font-semibold text-neutral-800">{user?.numar_matricol}</span>
                    </div>
                  )}

                  {hasValidAngajat && (
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">ID Angajat:</span>
                      <span className="font-semibold text-neutral-800">#{user?.id_angajat}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Tip cont:</span>
                    <span className="font-semibold text-neutral-800">
                      {isAdmin ? "Administrare Sistem" : user?.rol}
                    </span>
                  </div>
                </div>

                {isStudent ? (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-700">Cotă utilizată</span>
                      <span className="text-neutral-900">0 din 4</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-neutral-900 h-2 rounded-full w-0"></div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5">
                      Poți selecta încă 4 resurse în limita cotei maxime.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 space-y-1">
                      <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        <span>Cont administrativ</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Acest cont dispune de drepturi de gestiune și configurare a sistemului.
                        Pentru activități de utilizare didactică sau rezervări, este necesar un cont separat dedicat.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm text-neutral-900">Acces rapid</h3>
                <div className="space-y-2">
                  <Link to="/rooms" className="block">
                    <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
                      <DoorOpen className="h-3.5 w-3.5 mr-2" />
                      Consultă catalogul de săli
                    </Button>
                  </Link>
                  <Link to="/admin/academic" className="block">
                    <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
                      <Building className="h-3.5 w-3.5 mr-2" />
                      Structura academică
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
