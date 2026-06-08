"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, CubeIcon, CheckCircleIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline"
import { Logo } from "@/components/visco/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RegisterModal } from "@/components/visco/auth/register-modal"
import { toast } from "sonner"
import { fetchUser, persistUser } from "@/lib/auth-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL


function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const [email, setEmail] = useState("example@visco.com")
  const [password, setPassword] = useState("demo1234")
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  // If the URL has ?invite=TOKEN, auto-open the registration modal with
  // the token so the admin's "Copy registration link" just works.
  useEffect(() => {
    if (inviteToken) {
      setRegisterOpen(true)
      toast.info("Tienes una invitación. Completa tu registro.")
    }
  }, [inviteToken])

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
      persistUser(user)
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
      <section className="relative bg-primary text-white px-5 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-14 flex flex-col">
        <Logo size="md" variant="white" />

        <div className="my-auto max-w-md">
          <h2 className="font-serif italic text-4xl lg:text-5xl leading-tight text-balance">
            OriFlow | Visco Orinoco - Smart & Efficent Warehouse Management System
          </h2>
          <p className="mt-6 text-white/80 leading-relaxed text-pretty">
            Centralize purchasing, tracking, and inventory management for your warehouse.
            Designed for enterprise teams that need visibility, control, and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10">
          <StatCard icon={<CubeIcon className="size-4" />} label="INVENTARIO ACTIVO" value="45,910" unit="unidades" />
          <StatCard icon={<CheckCircleIcon className="size-4" />} label="TASA DE CUMPLIMIENTO" value="98.2%" unit="objetivo SLA" />
          <StatCard icon={<BuildingOffice2Icon className="size-4" />} label="PROVEEDORES ACTIVOS" value="89" unit="empresas" />
        </div>
      </section>

      {/* Right panel */}
      <section className="bg-background px-5 py-8 sm:px-6 sm:py-10 lg:px-14 lg:py-14 flex items-center">
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
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  Contraseña
                </Label>
                <button type="button" className="text-xs text-primary hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(c) => setRemember(!!c)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="remember" className="text-sm text-foreground">
                Recordar sesión
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => setRegisterOpen(true)}
              className="text-primary hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </section>
      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        inviteToken={inviteToken ?? undefined}
      />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
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
