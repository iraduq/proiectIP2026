import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  FlaskConical,
  Search,
  LayoutDashboard,
  Cpu,
  Calendar,
  ChevronRight,
  Bot,
  CircuitBoard,
  Activity,
  Printer,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

function WorkstationVisual() {
  return (
    <div className="w-full h-full bg-[#070b14] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
      <svg viewBox="0 0 240 140" className="w-full h-full object-cover">
        <rect width="240" height="140" fill="#060911" />
        <circle cx="120" cy="70" r="52" fill="none" stroke="#00f0ff" strokeWidth="3" opacity="0.9" filter="drop-shadow(0 0 10px #00f0ff)" />
        <circle cx="120" cy="70" r="42" fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
        <circle cx="120" cy="70" r="18" fill="#080f20" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="120" cy="70" r="8" fill="#38bdf8" />
        <path d="M120 52 C138 54 152 64 154 70 C142 74 130 63 120 52 Z" fill="#0284c7" opacity="0.75" />
        <path d="M138 70 C148 86 142 102 136 106 C126 98 130 84 138 70 Z" fill="#0284c7" opacity="0.75" />
        <path d="M120 88 C102 86 88 76 86 70 C98 66 110 77 120 88 Z" fill="#0284c7" opacity="0.75" />
        <path d="M102 70 C92 54 98 38 104 34 C114 42 110 56 102 70 Z" fill="#0284c7" opacity="0.75" />
        <circle cx="210" cy="70" r="45" fill="none" stroke="#00f0ff" strokeWidth="2" opacity="0.4" />
        <line x1="20" y1="20" x2="20" y2="120" stroke="#1e293b" strokeWidth="2" />
        <line x1="30" y1="20" x2="30" y2="120" stroke="#1e293b" strokeWidth="2" />
      </svg>
    </div>
  )
}

function RobotArmVisual() {
  return (
    <div className="w-full h-full bg-[#eef2f6] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="80" y="112" width="80" height="14" rx="3" fill="#1e293b" />
        <rect x="100" y="98" width="40" height="14" rx="2" fill="#0284c7" />
        <circle cx="120" cy="94" r="9" fill="#0369a1" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="120" y1="94" x2="94" y2="56" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
        <circle cx="94" cy="56" r="7.5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="94" y1="56" x2="142" y2="36" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
        <circle cx="142" cy="36" r="6.5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="142" y1="36" x2="158" y2="46" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <path d="M158 42 L170 39 M158 50 L170 53" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function IotKitVisual() {
  return (
    <div className="w-full h-full bg-[#0a0e17] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="48" y="24" width="144" height="92" rx="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
        <rect x="60" y="34" width="70" height="54" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <line x1="68" y1="42" x2="122" y2="42" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="50" x2="122" y2="50" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="58" x2="122" y2="58" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="66" x2="122" y2="66" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="74" x2="122" y2="74" stroke="#0f172a" strokeWidth="2.5" />
        <rect x="140" y="34" width="42" height="26" rx="2" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
        <text x="148" y="51" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">AI-IOT</text>
        <circle cx="150" cy="74" r="3.5" fill="#eab308" />
        <circle cx="162" cy="74" r="3.5" fill="#ef4444" />
        <circle cx="174" cy="74" r="3.5" fill="#3b82f6" />
        <line x1="58" y1="104" x2="182" y2="104" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />
      </svg>
    </div>
  )
}

function OscilloscopeVisual() {
  return (
    <div className="w-full h-full bg-[#1e2638] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="25" y="16" width="190" height="108" rx="5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <rect x="36" y="26" width="108" height="86" rx="3" fill="#051726" stroke="#0f766e" strokeWidth="1" />
        <line x1="36" y1="69" x2="144" y2="69" stroke="#0f766e" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="90" y1="26" x2="90" y2="112" stroke="#0f766e" strokeWidth="0.5" strokeDasharray="3 3" />
        <path d="M38 69 Q50 40 62 69 T86 69 T110 69 T134 69" fill="none" stroke="#22c55e" strokeWidth="2" />
        <circle cx="164" cy="42" r="9" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="190" cy="42" r="9" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="164" cy="74" r="6.5" fill="#64748b" />
        <circle cx="190" cy="74" r="6.5" fill="#64748b" />
        <circle cx="164" cy="98" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="190" cy="98" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    </div>
  )
}

function Printer3DVisual() {
  return (
    <div className="w-full h-full bg-[#18202d] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="55" y="14" width="130" height="114" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <rect x="68" y="26" width="104" height="90" rx="2" fill="#1e293b" stroke="#0284c7" strokeWidth="0.6" opacity="0.9" />
        <line x1="78" y1="26" x2="78" y2="116" stroke="#94a3b8" strokeWidth="3" />
        <line x1="162" y1="26" x2="162" y2="116" stroke="#94a3b8" strokeWidth="3" />
        <line x1="78" y1="58" x2="162" y2="58" stroke="#cbd5e1" strokeWidth="3.5" />
        <rect x="112" y="52" width="18" height="15" rx="2" fill="#f97316" />
        <polygon points="121,67 117,75 125,75" fill="#fbbf24" />
        <rect x="90" y="96" width="60" height="8" rx="1.5" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
        <circle cx="120" cy="10" r="8" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    {
      title: "Calculatoare AI",
      desc: "Stații de lucru pentru AI și calcul intensiv",
      icon: Cpu,
      visual: WorkstationVisual,
      catId: 1,
    },
    {
      title: "Roboți",
      desc: "Brațe robotice pentru proiecte practice",
      icon: Bot,
      visual: RobotArmVisual,
      catId: 2,
    },
    {
      title: "Kituri IoT",
      desc: "Seturi embedded și dezvoltare IoT",
      icon: CircuitBoard,
      visual: IotKitVisual,
      catId: 4,
    },
    {
      title: "Osciloscoape",
      desc: "Instrumente de măsurare și analiză",
      icon: Activity,
      visual: OscilloscopeVisual,
      catId: 3,
    },
    {
      title: "Imprimante 3D",
      desc: "Prototipare rapidă cu filament FDM",
      icon: Printer,
      visual: Printer3DVisual,
      catId: 5,
    },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      navigate(`/resources?search=${encodeURIComponent(searchTerm)}`)
    } else {
      navigate(`/login`)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <aside className="w-60 border-r border-[#e5e7eb] bg-white flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900 leading-tight">RRM</div>
              <div className="text-[10px] text-neutral-500">Resurse de laborator</div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută în RRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs bg-neutral-50 border-neutral-200 rounded-lg placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-semibold tracking-wider text-neutral-400 px-2 py-1 uppercase">
              Spațiu de lucru
            </div>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Panou de bord</span>
            </button>
            <button
              onClick={() => navigate(user ? "/resources" : "/login")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Catalog de resurse</span>
            </button>
            <button
              onClick={() => navigate(user ? "/reservations" : "/login")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Rezervările mele</span>
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="p-3 rounded-xl border border-dashed border-neutral-300 bg-white space-y-2">
            <div className="text-xs font-semibold text-neutral-900">Ajutor și ghiduri</div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Autentifică-te pentru a rezerva resurse.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full h-7 text-xs border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 rounded-md"
            >
              Autentificare
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#e5e7eb] bg-white px-8 flex items-center justify-between shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600 font-medium">
            <span>Spațiu de lucru</span>
            <ChevronRight className="h-3 w-3 text-neutral-400" />
            <span className="text-neutral-900 font-semibold">Bun venit</span>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs h-8 px-3.5 border-neutral-300 bg-white hover:bg-neutral-50 rounded-md font-medium"
                >
                  Autentificare
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="text-xs h-8 px-3.5 bg-black hover:bg-neutral-800 text-white rounded-md font-medium shadow-xs"
                >
                  Creează cont
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs h-8 px-3.5 bg-black hover:bg-neutral-800 text-white rounded-md font-medium"
              >
                Panou de bord
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 px-8 py-6 w-full space-y-6 overflow-y-auto">
          <Card className="relative overflow-hidden rounded-2xl bg-[#060911] text-white border-neutral-900 shadow-md min-h-[250px]">
            <div className="relative z-10 p-7 md:p-9 max-w-2xl space-y-3.5">
              <Badge
                variant="outline"
                className="bg-neutral-900/90 text-neutral-200 border-neutral-700 text-[11px] font-normal px-3 py-0.5 rounded-full"
              >
                Resource Research Manager
              </Badge>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Resursele potrivite.
                <br />
                La momentul potrivit.
              </h1>

              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Explorează resursele de laborator, verifică disponibilitatea și pregătește rezervarea în câțiva pași simpli.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(user ? "/resources" : "/login")}
                  className="border-white/40 bg-transparent hover:bg-white/10 text-white text-xs h-8 px-4 rounded-md font-medium"
                >
                  Explorează catalogul
                </Button>
                {!user && (
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs h-8 px-4 rounded-md border border-neutral-700 font-medium"
                  >
                    Creează un cont
                  </Button>
                )}
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-90 overflow-hidden flex items-center justify-end">
              <div className="absolute inset-0 bg-gradient-to-r from-[#060911] via-transparent to-transparent z-10" />
              <svg viewBox="0 0 400 250" className="h-full w-auto object-cover">
                <circle cx="280" cy="125" r="105" fill="none" stroke="#00f0ff" strokeWidth="3.5" opacity="0.9" filter="drop-shadow(0 0 16px #00f0ff)" />
                <circle cx="280" cy="125" r="82" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.6" />
                <circle cx="280" cy="125" r="34" fill="#080f20" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="280" cy="125" r="14" fill="#38bdf8" />
                <path d="M280 90 C315 96 340 114 345 125 C320 137 298 114 280 90 Z" fill="#0284c7" opacity="0.65" />
                <path d="M315 125 C335 155 320 185 312 192 C290 178 296 150 315 125 Z" fill="#0284c7" opacity="0.65" />
                <path d="M280 160 C245 154 220 136 215 125 C240 113 262 136 280 160 Z" fill="#0284c7" opacity="0.65" />
                <path d="M245 125 C225 95 240 65 248 58 C270 72 264 100 245 125 Z" fill="#0284c7" opacity="0.65" />
              </svg>
            </div>
          </Card>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută resurse după nume, categorie sau laborator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-xs bg-white border-neutral-200 rounded-xl shadow-xs placeholder:text-neutral-400"
            />
          </form>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-neutral-900">Ce resurse cauți?</h2>
              <span className="text-[11px] text-neutral-500 font-medium">Explorează după categorie</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {categories.map((c, i) => {
                const Icon = c.icon
                const Visual = c.visual
                return (
                  <Card
                    key={i}
                    onClick={() => navigate(user ? `/resources?cat=${c.catId}` : "/login")}
                    className="overflow-hidden border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer bg-white group flex flex-col justify-between"
                  >
                    <div className="h-28 w-full relative overflow-hidden border-b border-neutral-100">
                      <Visual />
                      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/10">
                        <Icon className="h-3 w-3" />
                        <span>{c.title}</span>
                      </div>
                    </div>

                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                        <span className="line-clamp-2 leading-tight pr-1">{c.desc}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-black shrink-0 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <Card className="p-6 border border-neutral-200 rounded-2xl bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-neutral-900">Cum rezervi o resursă</h2>
              <span className="text-[11px] text-neutral-500 font-medium">3 pași simpli</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#eaecf0] space-y-2">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </div>
                <div className="font-bold text-xs text-neutral-900">Autentifică-te</div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Accesul la rezervare necesită un cont instituțional.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#eaecf0] space-y-2">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </div>
                <div className="font-bold text-xs text-neutral-900">Alege resursa și intervalul</div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Caută în catalog și verifică disponibilitatea.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#eaecf0] space-y-2">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </div>
                <div className="font-bold text-xs text-neutral-900">Rezervă și urmărești</div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Gestionează rezervările din panoul personal.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="h-8 text-xs bg-black text-white hover:bg-neutral-800 rounded-md px-3.5 font-medium"
                >
                  Autentificare
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="h-8 text-xs border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 rounded-md px-3.5 font-medium"
                >
                  Creează cont
                </Button>
              </div>

              <button
                onClick={() => navigate(user ? "/resources" : "/login")}
                className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1"
              >
                <span>Catalog public</span>
                <span className="text-neutral-400">↗</span>
              </button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
