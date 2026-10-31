import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authApi, type RegistrationFaculty } from "../api/auth"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { AlertCircle, Calendar } from "lucide-react"

export function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [matricol, setMatricol] = useState("")
  const [role, setRole] = useState("STUDENT")
  const [faculties, setFaculties] = useState<RegistrationFaculty[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    authApi
      .getRegistrationFaculties()
      .then((items) => {
        setFaculties(items)
        if (items.length > 0) {
          setSelectedFacultyId(items[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        rol: role,
        numar_matricol: role === "STUDENT" ? matricol.trim() || null : null,
        facultate_id: role === "STUDENT" ? selectedFacultyId : null,
      })
      navigate("/dashboard")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Eroare la înregistrare. Verifică datele introduse."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-neutral-100 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
              RRM / kit
            </span>
            <span className="font-bold text-neutral-900 text-lg">Creare cont nou</span>
          </div>
          <Link to="/login" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
            Ai deja un cont? Autentifică-te
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Prenume</label>
              <Input
                type="text"
                required
                placeholder="ex: Andrei"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-neutral-50 border-neutral-200 text-sm h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Nume de familie</label>
              <Input
                type="text"
                required
                placeholder="ex: Popescu"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-neutral-50 border-neutral-200 text-sm h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Adresă de e-mail</label>
            <Input
              type="email"
              required
              placeholder="nume@univ.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-50 border-neutral-200 text-sm h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Parolă</label>
            <Input
              type="password"
              required
              placeholder="Minim 8 caractere, literă mare, cifră și simbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-50 border-neutral-200 text-sm h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Rol utilizator</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="STUDENT">Student</option>
              <option value="PROFESOR">Profesor</option>
              <option value="RESPONSABIL_LABORATOR">Responsabil Laborator</option>
            </select>
          </div>

          {role === "STUDENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Facultate afiliată</label>
                <select
                  value={selectedFacultyId || ""}
                  onChange={(e) => setSelectedFacultyId(Number(e.target.value))}
                  required
                  className="w-full h-11 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nume} ({f.cod}) - {f.institutie_nume}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Număr matricol</label>
                <Input
                  type="text"
                  placeholder="ex: CS123456"
                  value={matricol}
                  onChange={(e) => setMatricol(e.target.value)}
                  className="bg-neutral-50 border-neutral-200 text-sm h-11"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-neutral-900 hover:bg-black text-white font-semibold rounded-xl mt-4"
          >
            {isLoading ? "Se creează contul..." : "Înregistrare cont"}
          </Button>
        </form>

        <div className="text-xs text-neutral-400 flex items-center justify-center gap-2 pt-4 border-t border-neutral-100">
          <Calendar className="h-3.5 w-3.5" />
          <span>RRM / kit · Managementul resurselor de laborator</span>
        </div>
      </div>
    </div>
  )
}
