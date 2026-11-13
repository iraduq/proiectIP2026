import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { academicApi } from "../api/academic"
import { useAuth } from "../context/AuthContext"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { AcademicFilterBar } from "../components/academic/AcademicFilterBar"
import { InstitutionsGrid } from "../components/academic/InstitutionsGrid"
import { FacultiesTable, DepartmentsTable } from "../components/academic/AcademicStructureTables"
import {
  InstitutionFormModal,
  FacultyFormModal,
  DepartmentFormModal,
} from "../components/academic/AcademicModals"
import type { Department, Faculty, Institution } from "../types"

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

        <AcademicFilterBar
          tab={tab}
          search={search}
          onSearchChange={setSearch}
          filterInstitutionId={filterInstitutionId}
          onFilterInstitutionChange={setFilterInstitutionId}
          filterFacultyId={filterFacultyId}
          onFilterFacultyChange={setFilterFacultyId}
          institutions={institutions}
          faculties={faculties}
          onSubmit={handleSearchSubmit}
        />

        {tab === "institutions" && (
          <InstitutionsGrid
            institutions={institutions}
            isLoading={isLoading}
            isAdmin={Boolean(isAdmin)}
            onEdit={openEditInstitution}
            onToggle={handleToggleInstitution}
            onDelete={handleDeleteInstitution}
          />
        )}

        {tab === "faculties" && (
          <FacultiesTable
            faculties={faculties}
            isLoading={isLoading}
            isAdmin={Boolean(isAdmin)}
            onEdit={openEditFaculty}
            onToggle={handleToggleFaculty}
            onDelete={handleDeleteFaculty}
          />
        )}

        {tab === "departments" && (
          <DepartmentsTable
            departments={departments}
            isLoading={isLoading}
            isAdmin={Boolean(isAdmin)}
            onEdit={openEditDepartment}
            onToggle={handleToggleDepartment}
            onDelete={handleDeleteDepartment}
          />
        )}
      </div>

      {isInstModalOpen && (
        <InstitutionFormModal
          editingInst={editingInst}
          modalError={modalError}
          isSubmitting={isSubmitting}
          instCod={instCod}
          instOras={instOras}
          instNume={instNume}
          instAdresa={instAdresa}
          instEmail={instEmail}
          instTelefon={instTelefon}
          instWebsite={instWebsite}
          onChangeCod={setInstCod}
          onChangeOras={setInstOras}
          onChangeNume={setInstNume}
          onChangeAdresa={setInstAdresa}
          onChangeEmail={setInstEmail}
          onChangeTelefon={setInstTelefon}
          onChangeWebsite={setInstWebsite}
          onClose={() => setIsInstModalOpen(false)}
          onSubmit={handleSaveInstitution}
        />
      )}

      {isFacModalOpen && (
        <FacultyFormModal
          editingFac={editingFac}
          institutions={institutions}
          modalError={modalError}
          isSubmitting={isSubmitting}
          facInstitutieId={facInstitutieId}
          facCod={facCod}
          facNume={facNume}
          facDescriere={facDescriere}
          onChangeInstitutieId={setFacInstitutieId}
          onChangeCod={setFacCod}
          onChangeNume={setFacNume}
          onChangeDescriere={setFacDescriere}
          onClose={() => setIsFacModalOpen(false)}
          onSubmit={handleSaveFaculty}
        />
      )}

      {isDeptModalOpen && (
        <DepartmentFormModal
          editingDept={editingDept}
          faculties={faculties}
          modalError={modalError}
          isSubmitting={isSubmitting}
          deptFacultateId={deptFacultateId}
          deptCod={deptCod}
          deptNume={deptNume}
          deptSefId={deptSefId}
          deptDescriere={deptDescriere}
          onChangeFacultateId={setDeptFacultateId}
          onChangeCod={setDeptCod}
          onChangeNume={setDeptNume}
          onChangeSefId={setDeptSefId}
          onChangeDescriere={setDeptDescriere}
          onClose={() => setIsDeptModalOpen(false)}
          onSubmit={handleSaveDepartment}
        />
      )}
    </AppLayout>
  )
}
