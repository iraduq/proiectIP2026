import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { AlertCircle, FlaskConical, Calendar, ArrowRight } from "lucide-react"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate("/dashboard")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Credențiale incorecte. Verifică email-ul și parola."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestAccount = (testEmail: string) => {
    setEmail(testEmail)
    setPassword("Password123!")
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 lg:p-14 shadow-sm border border-neutral-100">
        <div className="flex flex-col justify-between h-full space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
                RRM / kit
              </span>
              <span className="font-bold text-neutral-900 text-lg">RRM / kit</span>
            </div>

            <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500 flex items-center gap-1.5">
              <span>ⓘ</span>
              <span>SPAȚIUL TĂU DE LABORATOR</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight">
              De la resursa potrivită<br />la următorul proiect.
            </h1>

            <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
              Găsește echipamente, verifică disponibilitatea și organizează rezervările într-un singur loc.
            </p>

            <div className="space-y-3 pt-2 max-w-md">
              <div className="bg-neutral-900 text-white p-4 rounded-xl flex items-center gap-4 text-sm font-medium shadow-sm">
                <span className="text-neutral-400 font-mono text-xs">01</span>
                <span>Explorează catalogul de resurse</span>
              </div>
              <div className="bg-neutral-900 text-white p-4 rounded-xl flex items-center gap-4 text-sm font-medium shadow-sm">
                <span className="text-neutral-400 font-mono text-xs">02</span>
                <span>Alege un interval disponibil</span>
              </div>
              <div className="bg-neutral-900 text-white p-4 rounded-xl flex items-center gap-4 text-sm font-medium shadow-sm">
                <span className="text-neutral-400 font-mono text-xs">03</span>
                <span>Urmărește rezervările tale</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-2 pt-4">
            <Calendar className="h-3.5 w-3.5" />
            <span>RRM / kit · Managementul resurselor de laborator</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-neutral-200 shadow-lg space-y-6">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Bine ai revenit</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Autentifică-te pentru a continua în RRM / kit.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Adresă de e-mail</label>
                <Input
                  type="email"
                  required
                  placeholder="nume@exemplu.ro"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-50 border-neutral-200 text-sm h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-neutral-900 hover:bg-black text-white font-semibold rounded-xl mt-2"
              >
                {isLoading ? "Se autentifică..." : "Autentificare"}
              </Button>
            </form>

            <div className="pt-2 border-t border-neutral-100">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Autentificare rapidă de test:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillTestAccount("student1@univ.ro")}
                  className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="font-semibold text-neutral-900 text-xs">Student</div>
                  <div className="text-[10px] text-neutral-500 font-mono">student1@univ.ro</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillTestAccount("lab1@univ.ro")}
                  className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="font-semibold text-neutral-900 text-xs">Responsabil Lab</div>
                  <div className="text-[10px] text-neutral-500 font-mono">lab1@univ.ro</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillTestAccount("prof1@univ.ro")}
                  className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="font-semibold text-neutral-900 text-xs">Profesor</div>
                  <div className="text-[10px] text-neutral-500 font-mono">prof1@univ.ro</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillTestAccount("admin1@univ.ro")}
                  className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="font-semibold text-neutral-900 text-xs">Administrator</div>
                  <div className="text-[10px] text-neutral-500 font-mono">admin1@univ.ro</div>
                </button>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-600">Nu ai încă un cont?</span>
              <Link to="/register">
                <Button variant="outline" size="sm" className="font-semibold text-xs">
                  Creează un cont
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
