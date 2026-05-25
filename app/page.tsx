"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Package, CheckCircle2, Building2 } from "lucide-react"
import { Logo } from "@/components/visco/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RegisterModal } from "@/components/visco/auth/register-modal"
import { toast } from "sonner"
import { fetchUser } from "@/lib/auth-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("example@visco.com")
  const [password, setPassword] = useState("demo1234")
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Ingresa tus credenciales para continuar")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al iniciar sesión" }))
        toast.error(err.error || "Error al iniciar sesión")
        return
      }
      const user = await fetchUser()
      if (!user) {
        toast.error("La sesión no se pudo establecer. Verifica que el backend haya configurado las cookies correctamente.")
        return
      }
      toast.success("Sesión iniciada")
      router.push("/dashboard")
    } catch {
      toast.error("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <section className="relative bg-[#7b1a1a] text-white px-5 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-14 flex flex-col">
        <Logo size="md" />

        <div className="my-auto max-w-md">
          <h2 className="font-serif italic text-4xl lg:text-5xl leading-tight text-balance">
            Visco Orinoco Nexus - Gestión de compras inteligente y eficiente.
          </h2>
          <p className="mt-6 text-white/80 leading-relaxed text-pretty">
            Centraliza inventario, procurement y proveedores en una sola plataforma.
            Diseñada para equipos enterprise que necesitan visibilidad, control y velocidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10">
          <StatCard icon={<Package className="size-4" />} label="INVENTARIO ACTIVO" value="45,910" unit="unidades" />
          <StatCard icon={<CheckCircle2 className="size-4" />} label="TASA DE CUMPLIMIENTO" value="98.2%" unit="objetivo SLA" />
          <StatCard icon={<Building2 className="size-4" />} label="PROVEEDORES ACTIVOS" value="89" unit="empresas" />
        </div>
      </section>

      {/* Right panel */}
      <section className="bg-[#f5f5f7] px-5 py-8 sm:px-6 sm:py-10 lg:px-14 lg:py-14 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="font-serif text-3xl font-semibold text-foreground">Bienvenido de vuelta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white h-11"
                  placeholder="nombre@empresa.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-white h-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                  className="data-[state=checked]:bg-[#7b1a1a] data-[state=checked]:border-[#7b1a1a]"
                />
                <span className="text-foreground">Recordarme</span>
              </label>
              <a href="#" className="text-[#7b1a1a] hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#7b1a1a] hover:bg-[#5c1212] text-white font-medium"
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#f5f5f7] px-3 text-muted-foreground uppercase tracking-wider">
                  o continúa con
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-white font-medium"
            >
              <GoogleIcon className="size-4" />
              Continuar con Google SSO
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setRegisterOpen(true)}
                className="text-[#7b1a1a] hover:underline font-medium"
              >
                Solicitar acceso
              </button>
            </p>
          </form>
        </div>
      </section>

      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="rounded-lg bg-white/10 backdrop-blur-sm ring-1 ring-white/15 p-4">
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        <span className="text-[10px] tracking-[0.12em] uppercase font-medium">{label}</span>
      </div>
      <div className="mt-2 font-serif text-2xl font-semibold">{value}</div>
      <div className="text-xs text-white/65 mt-0.5">{unit}</div>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.45.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}
