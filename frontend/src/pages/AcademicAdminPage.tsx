import { useEffect, useState } from "react"
import { academicApi } from "../api/academic"
import { useAuth } from "../context/AuthContext"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import type { Department, Faculty, Institution } from "../types"
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  Plus,
  Pencil,
  Power,
  Trash2,
  X,
  AlertCircle,
  Search,
} from "lucide-react"

export function AcademicAdminPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")

  const [tab, setTab] = useState<"institutions" | "faculties" | "departments">("institutions")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [search, setSearch] = useState("")
  const [filterInstitutionId, setFilterInstitutionId] = useState<number | undefined>(undefined)
  const [filterFacultyId, setFilterFacultyId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const [isInstModalOpen, setIsInstModalOpen] = useState(false)
  const [editingInst, setEditingInst] = useState<Institution | null>(null)
  const [instNume, setInstNume] = useState("")
  const [instCod, setInstCod] = useState("")
  const [instOras, setInstOras] = useState("")
  const [instAdresa, setInstAdresa] = useState("")
  const [instEmail, setInstEmail] = useState("")
  const [instTelefon, setInstTelefon] = useState("")
  const [instWebsite, setInstWebsite] = useState("")

  const [isFacModalOpen, setIsFacModalOpen] = useState(false)
  const [editingFac, setEditingFac] = useState<Faculty | null>(null)
  const [facInstitutieId, setFacInstitutieId] = useState<number>(0)
  const [facNume, setFacNume] = useState("")
  const [facCod, setFacCod] = useState("")
  const [facDescriere, setFacDescriere] = useState("")

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptFacultateId, setDeptFacultateId] = useState<number>(0)
  const [deptNume, setDeptNume] = useState("")
  const [deptCod, setDeptCod] = useState("")
  const [deptDescriere, setDeptDescriere] = useState("")
  const [deptSefId, setDeptSefId] = useState<string>("")

  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadHierarchyData = async () => {
    try {
      const [iRes, fRes] = await Promise.all([
        academicApi.getInstitutions({ limit: 100 }),
        academicApi.getFaculties({ limit: 100 }),
      ])
      setInstitutions(iRes.items)
      setFaculties(fRes.items)
      if (iRes.items.length > 0 && facInstitutieId === 0) {
        setFacInstitutieId(iRes.items[0].id)
      }
      if (fRes.items.length > 0 && deptFacultateId === 0) {
        setDeptFacultateId(fRes.items[0].id)
      }
    } catch {}
  }

  useEffect(() => {
    loadHierarchyData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (tab === "institutions") {
        const res = await academicApi.getInstitutions({
          search: search.trim() || undefined,
          limit: 100,
        })
        setInstitutions(res.items)
      } else if (tab === "faculties") {
        const res = await academicApi.getFaculties({
          institutie_id: filterInstitutionId,
          search: search.trim() || undefined,
          limit: 100,
        })
        setFaculties(res.items)
      } else {
        const res = await academicApi.getDepartments({
          facultate_id: filterFacultyId,
          institutie_id: filterInstitutionId,
          search: search.trim() || undefined,
          limit: 200,
        })
        setDepartments(res.items)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab, filterInstitutionId, filterFacultyId])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const openAddInstitution = () => {
    setEditingInst(null)
    setModalError(null)
    setInstNume("")
    setInstCod("")
    setInstOras("")
    setInstAdresa("")
    setInstEmail("")
    setInstTelefon("")
    setInstWebsite("")
    setIsInstModalOpen(true)
  }

  const openEditInstitution = (inst: Institution) => {
    setEditingInst(inst)
    setModalError(null)
    setInstNume(inst.nume)
    setInstCod(inst.cod)
    setInstOras(inst.oras)
    setInstAdresa(inst.adresa)
    setInstEmail(inst.email_contact || "")
    setInstTelefon(inst.telefon || "")
    setInstWebsite(inst.website || "")
    setIsInstModalOpen(true)
  }

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      if (editingInst) {
        await academicApi.updateInstitution(editingInst.id, {
          nume: instNume.trim(),
          cod: instCod.trim().toUpperCase(),
          oras: instOras.trim(),
          adresa: instAdresa.trim(),
          email_contact: instEmail.trim() || null,
          telefon: instTelefon.trim() || null,
          website: instWebsite.trim() || null,
        })
      } else {
        await academicApi.createInstitution({
          nume: instNume.trim(),
          cod: instCod.trim().toUpperCase(),
          oras: instOras.trim(),
          adresa: instAdresa.trim(),
          email_contact: instEmail.trim() || null,
          telefon: instTelefon.trim() || null,
          website: instWebsite.trim() || null,
        })
      }
      setIsInstModalOpen(false)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Eroare la salvarea instituției.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleInstitution = async (inst: Institution) => {
    try {
      if (inst.is_active) {
        await academicApi.deactivateInstitution(inst.id)
      } else {
        await academicApi.activateInstitution(inst.id)
      }
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării.")
    }
  }

  const handleDeleteInstitution = async (inst: Institution) => {
    if (!confirm(`Ești sigur că vrei să ștergi instituția ${inst.cod}?`)) return
    try {
      await academicApi.deleteInstitution(inst.id)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergere.")
    }
  }

  const openAddFaculty = () => {
    setEditingFac(null)
    setModalError(null)
    setFacNume("")
    setFacCod("")
    setFacDescriere("")
    if (institutions.length > 0 && facInstitutieId === 0) {
      setFacInstitutieId(institutions[0].id)
    }
    setIsFacModalOpen(true)
  }

  const openEditFaculty = (fac: Faculty) => {
    setEditingFac(fac)
    setModalError(null)
    setFacInstitutieId(fac.institutie_id)
    setFacNume(fac.nume)
    setFacCod(fac.cod)
    setFacDescriere(fac.descriere || "")
    setIsFacModalOpen(true)
  }

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      if (editingFac) {
        await academicApi.updateFaculty(editingFac.id, {
          nume: facNume.trim(),
          cod: facCod.trim().toUpperCase(),
          descriere: facDescriere.trim() || null,
        })
      } else {
        await academicApi.createFaculty({
          institutie_id: Number(facInstitutieId),
          nume: facNume.trim(),
          cod: facCod.trim().toUpperCase(),
          descriere: facDescriere.trim() || null,
        })
      }
      setIsFacModalOpen(false)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Eroare la salvarea facultății.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFaculty = async (fac: Faculty) => {
    try {
      if (fac.is_active) {
        await academicApi.deactivateFaculty(fac.id)
      } else {
        await academicApi.activateFaculty(fac.id)
      }
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării.")
    }
  }

  const handleDeleteFaculty = async (fac: Faculty) => {
    if (!confirm(`Ești sigur că vrei să ștergi facultatea ${fac.cod}?`)) return
    try {
      await academicApi.deleteFaculty(fac.id)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergere.")
    }
  }

  const openAddDepartment = () => {
    setEditingDept(null)
    setModalError(null)
    setDeptNume("")
    setDeptCod("")
    setDeptDescriere("")
    setDeptSefId("")
    if (faculties.length > 0 && deptFacultateId === 0) {
      setDeptFacultateId(faculties[0].id)
    }
    setIsDeptModalOpen(true)
  }

  const openEditDepartment = (dept: Department) => {
    setEditingDept(dept)
    setModalError(null)
    setDeptFacultateId(dept.facultate_id)
    setDeptNume(dept.nume)
    setDeptCod(dept.cod)
    setDeptDescriere(dept.descriere || "")
    setDeptSefId(dept.sef_departament ? String(dept.sef_departament.id_utilizator) : "")
    setIsDeptModalOpen(true)
  }

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      const sefIdNum = deptSefId.trim() ? Number(deptSefId.trim()) : null
      if (editingDept) {
        await academicApi.updateDepartment(editingDept.id, {
          nume: deptNume.trim(),
          cod: deptCod.trim().toUpperCase(),
          descriere: deptDescriere.trim() || null,
          sef_departament_id: sefIdNum,
        })
      } else {
        await academicApi.createDepartment({
          facultate_id: Number(deptFacultateId),
          nume: deptNume.trim(),
          cod: deptCod.trim().toUpperCase(),
          descriere: deptDescriere.trim() || null,
          sef_departament_id: sefIdNum,
        })
      }
      setIsDeptModalOpen(false)
      loadData()
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Eroare la salvarea departamentului.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleDepartment = async (dept: Department) => {
    try {
      if (dept.is_active) {
        await academicApi.deactivateDepartment(dept.id)
      } else {
        await academicApi.activateDepartment(dept.id)
      }
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării.")
    }
  }

  const handleDeleteDepartment = async (dept: Department) => {
    if (!confirm(`Ești sigur că vrei să ștergi departamentul ${dept.cod}?`)) return
    try {
      await academicApi.deleteDepartment(dept.id)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergere.")
    }
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Structură academică"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Structură academică</h1>
            <p className="text-xs text-neutral-500 mt-1">
              {isAdmin
                ? "Gestiune completă a instituțiilor, facultăților și departamentelor"
                : "Vizualizează ierarhia instituțiilor, facultăților și departamentelor"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setTab("institutions")
                  setSearch("")
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === "institutions"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Instituții ({institutions.length})
              </button>
              <button
                onClick={() => {
                  setTab("faculties")
                  setSearch("")
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === "faculties"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Facultăți ({faculties.length})
              </button>
              <button
                onClick={() => {
                  setTab("departments")
                  setSearch("")
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === "departments"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Departamente ({departments.length})
              </button>
            </div>

            {isAdmin && tab === "institutions" && (
              <Button
                onClick={openAddInstitution}
                size="sm"
                className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Adaugă instituție</span>
              </Button>
            )}

            {isAdmin && tab === "faculties" && (
              <Button
                onClick={openAddFaculty}
                size="sm"
                className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Adaugă facultate</span>
              </Button>
            )}

            {isAdmin && tab === "departments" && (
              <Button
                onClick={openAddDepartment}
                size="sm"
                className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Adaugă departament</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="rounded-2xl border-neutral-200 shadow-sm p-4 bg-white">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder={`Caută în ${
                  tab === "institutions"
                    ? "instituții..."
                    : tab === "faculties"
                    ? "facultăți..."
                    : "departamente..."
                }`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-neutral-50 border-neutral-200"
              />
            </div>

            {tab === "faculties" && (
              <select
                value={filterInstitutionId || ""}
                onChange={(e) =>
                  setFilterInstitutionId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800"
              >
                <option value="">Toate instituțiile</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nume} ({i.cod})
                  </option>
                ))}
              </select>
            )}

            {tab === "departments" && (
              <>
                <select
                  value={filterInstitutionId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    setFilterInstitutionId(val)
                    setFilterFacultyId(undefined)
                  }}
                  className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800"
                >
                  <option value="">Toate instituțiile</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nume} ({i.cod})
                    </option>
                  ))}
                </select>

                <select
                  value={filterFacultyId || ""}
                  onChange={(e) =>
                    setFilterFacultyId(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800"
                >
                  <option value="">Toate facultățile</option>
                  {(filterInstitutionId
                    ? faculties.filter((f) => f.institutie_id === filterInstitutionId)
                    : faculties
                  ).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nume} ({f.cod})
                    </option>
                  ))}
                </select>
              </>
            )}

            <Button type="submit" size="sm" className="h-9 text-xs bg-neutral-900 hover:bg-black font-semibold">
              Filtrează
            </Button>
          </form>
        </Card>

        {tab === "institutions" && (
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
                        onClick={() => openEditInstitution(inst)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded"
                        title="Editează instituția"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleInstitution(inst)}
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
                        onClick={() => handleDeleteInstitution(inst)}
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
        )}

        {tab === "faculties" && (
          <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3 px-5">Cod</th>
                    <th className="py-3 px-5">Denumire facultate</th>
                    <th className="py-3 px-5">Instituție</th>
                    <th className="py-3 px-5">Descriere</th>
                    <th className="py-3 px-5">Stare</th>
                    {isAdmin && <th className="py-3 px-5 text-right">Acțiuni</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Se încarcă facultățile...
                      </td>
                    </tr>
                  ) : faculties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Nicio facultate găsită.
                      </td>
                    </tr>
                  ) : (
                    faculties.map((f) => (
                      <tr key={f.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-5 font-mono font-bold text-neutral-900">{f.cod}</td>
                        <td className="py-3 px-5 font-medium text-neutral-800">{f.nume}</td>
                        <td className="py-3 px-5 text-neutral-500">{f.institutie_nume}</td>
                        <td className="py-3 px-5 text-neutral-500 max-w-xs truncate">{f.descriere || "-"}</td>
                        <td className="py-3 px-5">
                          <Badge variant={f.is_active ? "success" : "secondary"}>
                            {f.is_active ? "Activă" : "Inactivă"}
                          </Badge>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditFaculty(f)}
                                className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                                title="Editează facultate"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleFaculty(f)}
                                className={`p-1.5 rounded ${
                                  f.is_active
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={f.is_active ? "Dezactivează facultatea" : "Activează facultatea"}
                              >
                                <Power className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFaculty(f)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Șterge facultate"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "departments" && (
          <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3 px-5">Cod</th>
                    <th className="py-3 px-5">Departament</th>
                    <th className="py-3 px-5">Facultate</th>
                    <th className="py-3 px-5">Șef departament</th>
                    <th className="py-3 px-5">Stare</th>
                    {isAdmin && <th className="py-3 px-5 text-right">Acțiuni</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Se încarcă departamentele...
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Niciun departament găsit.
                      </td>
                    </tr>
                  ) : (
                    departments.map((d) => (
                      <tr key={d.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-5 font-mono font-bold text-neutral-900">{d.cod}</td>
                        <td className="py-3 px-5 font-medium text-neutral-800">{d.nume}</td>
                        <td className="py-3 px-5 text-neutral-500">{d.facultate_nume}</td>
                        <td className="py-3 px-5 text-neutral-700 font-medium">
                          {d.sef_departament?.nume || "Neatribuit"}
                        </td>
                        <td className="py-3 px-5">
                          <Badge variant={d.is_active ? "success" : "secondary"}>
                            {d.is_active ? "Activ" : "Inactiv"}
                          </Badge>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditDepartment(d)}
                                className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                                title="Editează departament"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleDepartment(d)}
                                className={`p-1.5 rounded ${
                                  d.is_active
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={d.is_active ? "Dezactivează departamentul" : "Activează departamentul"}
                              >
                                <Power className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(d)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Șterge departament"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {isInstModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingInst ? `Editează ${editingInst.cod}` : "Adaugă instituție nouă"}
              </h3>
              <button
                onClick={() => setIsInstModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveInstitution} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Cod instituție</label>
                  <Input
                    type="text"
                    placeholder="ex: UPB"
                    value={instCod}
                    onChange={(e) => setInstCod(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Oraș</label>
                  <Input
                    type="text"
                    placeholder="ex: București"
                    value={instOras}
                    onChange={(e) => setInstOras(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Denumire completă</label>
                <Input
                  type="text"
                  placeholder="ex: Universitatea Națională de Știință și Tehnologie Politehnica"
                  value={instNume}
                  onChange={(e) => setInstNume(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Adresă sediu</label>
                <Input
                  type="text"
                  placeholder="ex: Splaiul Independenței nr. 313"
                  value={instAdresa}
                  onChange={(e) => setInstAdresa(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Email contact</label>
                  <Input
                    type="email"
                    placeholder="contact@upb.ro"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Telefon</label>
                  <Input
                    type="text"
                    placeholder="+40214029100"
                    value={instTelefon}
                    onChange={(e) => setInstTelefon(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Website</label>
                <Input
                  type="url"
                  placeholder="https://upb.ro"
                  value={instWebsite}
                  onChange={(e) => setInstWebsite(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInstModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-neutral-900 hover:bg-black text-white"
                >
                  {isSubmitting ? "Se salvează..." : "Salvează instituția"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFacModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingFac ? `Editează ${editingFac.cod}` : "Adaugă facultate nouă"}
              </h3>
              <button
                onClick={() => setIsFacModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFaculty} className="space-y-3 text-xs">
              {!editingFac && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Instituție părinte</label>
                  <select
                    value={facInstitutieId}
                    onChange={(e) => setFacInstitutieId(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-neutral-200 px-3 bg-neutral-50 text-xs"
                    required
                  >
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nume} ({i.cod})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Cod facultate</label>
                  <Input
                    type="text"
                    placeholder="ex: ACS"
                    value={facCod}
                    onChange={(e) => setFacCod(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Denumire facultate</label>
                  <Input
                    type="text"
                    placeholder="ex: Automatică și Calculatoare"
                    value={facNume}
                    onChange={(e) => setFacNume(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Descriere (opțional)</label>
                <textarea
                  value={facDescriere}
                  onChange={(e) => setFacDescriere(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFacModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-neutral-900 hover:bg-black text-white"
                >
                  {isSubmitting ? "Se salvează..." : "Salvează facultatea"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingDept ? `Editează ${editingDept.cod}` : "Adaugă departament nou"}
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDepartment} className="space-y-3 text-xs">
              {!editingDept && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Facultate părinte</label>
                  <select
                    value={deptFacultateId}
                    onChange={(e) => setDeptFacultateId(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-neutral-200 px-3 bg-neutral-50 text-xs"
                    required
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nume} ({f.cod}) - {f.institutie_nume}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Cod departament</label>
                  <Input
                    type="text"
                    placeholder="ex: CALCULATOARE"
                    value={deptCod}
                    onChange={(e) => setDeptCod(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Denumire departament</label>
                  <Input
                    type="text"
                    placeholder="ex: Calculatoare și Tehnologia Informației"
                    value={deptNume}
                    onChange={(e) => setDeptNume(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  ID utilizator șef departament (profesor - opțional)
                </label>
                <Input
                  type="number"
                  placeholder="Lăsați gol dacă nu este atribuit"
                  value={deptSefId}
                  onChange={(e) => setDeptSefId(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Descriere (opțional)</label>
                <textarea
                  value={deptDescriere}
                  onChange={(e) => setDeptDescriere(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeptModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-neutral-900 hover:bg-black text-white"
                >
                  {isSubmitting ? "Se salvează..." : "Salvează departamentul"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
