import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { AuthBrandingPanel } from "../components/auth/AuthBrandingPanel"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

export function RegisterPage() {
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Parolele introduse nu coincid.")
      return
    }

    setIsLoading(true)
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        rol: "STUDENT",
      })
      navigate("/dashboard")
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === "string") {
        setError(detail)
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0]?.msg || "Eroare la înregistrare. Verifică datele introduse.")
      } else {
        setError("Eroare la înregistrare. Verifică datele introduse.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[1120px] min-h-[760px] bg-white rounded-3xl shadow-sm border border-neutral-200/60 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <AuthBrandingPanel />

        <div className="lg:col-span-7 bg-white flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-[360px] space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Creează un cont
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Un singur cont pentru resursele și rezervările tale.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 block">Nume</label>
                  <Input
                    type="text"
                    required
                    placeholder="Introdu numele"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 rounded-lg border-neutral-200 bg-white text-xs placeholder:text-neutral-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 block">Prenume</label>
                  <Input
                    type="text"
                    required
                    placeholder="Introdu numele"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 rounded-lg border-neutral-200 bg-white text-xs placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 block">
                  Adresă de e-mail instituțională
                </label>
                <Input
                  type="email"
                  required
                  placeholder="nume@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-lg border-neutral-200 bg-white text-xs placeholder:text-neutral-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 block">Parolă</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border-neutral-200 bg-white text-xs placeholder:text-neutral-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 block">
                  Confirmă parola
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-lg border-neutral-200 bg-white text-xs placeholder:text-neutral-400"
                />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                  />
                  <span>Ține-mă minte</span>
                </label>

                <Link to="/login" className="text-xs font-semibold text-neutral-800 hover:underline">
                  Ai uitat parola?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg"
              >
                {isLoading ? "Se creează contul..." : "Autentifică-te"}
              </Button>
            </form>

            <div className="pt-4 border-t border-neutral-100 text-center text-xs text-neutral-400">
              <span>Nu ai încă un cont? </span>
              <Link to="/login" className="font-bold text-neutral-800 hover:underline ml-1">
                Creează un cont
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
