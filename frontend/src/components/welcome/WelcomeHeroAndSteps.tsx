import { ChevronRight } from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { WELCOME_CATEGORIES, WELCOME_STEPS } from "../../data/welcomeConstants"

interface WelcomeHeroProps {
  isAuthenticated: boolean
  onNavigate: (path: string) => void
}

export function WelcomeHero({ isAuthenticated, onNavigate }: WelcomeHeroProps) {
  return (
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
          Explorează resursele de laborator, verifică disponibilitatea și pregătește rezervarea în
          câțiva pași simpli.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onNavigate(isAuthenticated ? "/resources" : "/login")}
            className="border-white/40 bg-transparent hover:bg-white/10 text-white text-xs h-8 px-4 rounded-md font-medium"
          >
            Explorează catalogul
          </Button>
          {!isAuthenticated && (
            <Button
              onClick={() => onNavigate("/register")}
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
  )
}

export function WelcomeCategoriesAndSteps({
  isAuthenticated,
  onNavigate,
}: {
  isAuthenticated: boolean
  onNavigate: (path: string) => void
}) {
  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-900">Ce resurse cauți?</h2>
          <span className="text-[11px] text-neutral-500 font-medium">Explorează după categorie</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {WELCOME_CATEGORIES.map((c) => {
            const Icon = c.icon
            const Visual = c.visual
            return (
              <Card
                key={c.catId}
                onClick={() => onNavigate(isAuthenticated ? `/resources?cat=${c.catId}` : "/login")}
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
          {WELCOME_STEPS.map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-[#f8f9fa] border border-[#eaecf0] space-y-2">
              <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                {item.step}
              </div>
              <div className="font-bold text-xs text-neutral-900">{item.title}</div>
              <p className="text-[11px] text-neutral-500 leading-snug">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onNavigate("/login")}
              className="h-8 text-xs bg-black text-white hover:bg-neutral-800 rounded-md px-3.5 font-medium"
            >
              Autentificare
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("/register")}
              className="h-8 text-xs border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 rounded-md px-3.5 font-medium"
            >
              Creează cont
            </Button>
          </div>
          <button
            onClick={() => onNavigate(isAuthenticated ? "/resources" : "/login")}
            className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1"
          >
            <span>Catalog public</span>
            <span className="text-neutral-400">↗</span>
          </button>
        </div>
      </Card>
    </>
  )
}
