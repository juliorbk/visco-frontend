"use client"

import { PackageCheck, Clock, PackageOpen, CheckCircle } from "lucide-react"

interface KPICardsProps {
  todayCount: number
  pendingCount: number
  partialCount: number
  completedCount: number
}

export function InboundsKPICards({ todayCount, pendingCount, partialCount, completedCount }: KPICardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {/* Recepciones hoy */}
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6b7280]">Recepciones hoy</p>
            <p className="text-3xl font-bold text-[#111827] mt-2">{todayCount}</p>
          </div>
          <div className="bg-[#fde8e8] p-3 rounded-lg">
            <PackageCheck className="w-6 h-6 text-[#7b1a1a]" />
          </div>
        </div>
      </div>

      {/* Pendientes de recibir */}
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6b7280]">Pendientes de recibir</p>
            <p className="text-3xl font-bold text-[#111827] mt-2">{pendingCount}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-700" />
          </div>
        </div>
      </div>

      {/* Parcialmente recibidas */}
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6b7280]">Parcialmente recibidas</p>
            <p className="text-3xl font-bold text-[#111827] mt-2">{partialCount}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <PackageOpen className="w-6 h-6 text-orange-700" />
          </div>
        </div>
      </div>

      {/* Completadas este mes */}
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6b7280]">Completadas este mes</p>
            <p className="text-3xl font-bold text-[#111827] mt-2">{completedCount}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
