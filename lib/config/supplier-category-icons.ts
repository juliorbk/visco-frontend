import {
  BuildingOffice2Icon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  CubeIcon,
  BeakerIcon,
  BoltIcon,
  GlobeAltIcon,
  Cog8ToothIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  BanknotesIcon,
  HeartIcon,
  SunIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

export interface CategoryIconOption {
  key: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { key: "building-office", icon: BuildingOffice2Icon, label: "Building" },
  { key: "truck", icon: TruckIcon, label: "Transport" },
  { key: "wrench-screwdriver", icon: WrenchScrewdriverIcon, label: "Tools" },
  { key: "computer-desktop", icon: ComputerDesktopIcon, label: "Technology" },
  { key: "shield-check", icon: ShieldCheckIcon, label: "Security" },
  { key: "cube", icon: CubeIcon, label: "Products" },
  { key: "beaker", icon: BeakerIcon, label: "Laboratory" },
  { key: "bolt", icon: BoltIcon, label: "Energy" },
  { key: "globe-alt", icon: GlobeAltIcon, label: "International" },
  { key: "cog-8-tooth", icon: Cog8ToothIcon, label: "Services" },
  { key: "chart-bar", icon: ChartBarIcon, label: "Analytics" },
  { key: "clipboard-document-list", icon: ClipboardDocumentListIcon, label: "Documents" },
  { key: "tag", icon: TagIcon, label: "Tags" },
  { key: "banknotes", icon: BanknotesIcon, label: "Finance" },
  { key: "heart", icon: HeartIcon, label: "Health" },
  { key: "sun", icon: SunIcon, label: "Energy" },
]

export function getCategoryIcon(key: string | null | undefined): ComponentType<SVGProps<SVGSVGElement>> {
  return CATEGORY_ICONS.find((c) => c.key === key)?.icon ?? BuildingOffice2Icon
}

export interface CategoryColorOption {
  key: string
  value: string
  label: string
}

export const CATEGORY_COLORS: CategoryColorOption[] = [
  { key: "red", value: "#7b1a1a", label: "Red" },
  { key: "teal", value: "#0f766e", label: "Teal" },
  { key: "blue", value: "#1d4ed8", label: "Blue" },
  { key: "purple", value: "#9333ea", label: "Purple" },
  { key: "amber", value: "#b45309", label: "Amber" },
  { key: "green", value: "#15803d", label: "Green" },
  { key: "pink", value: "#be185d", label: "Pink" },
  { key: "sky", value: "#0369a1", label: "Sky" },
  { key: "indigo", value: "#4f46e5", label: "Indigo" },
  { key: "orange", value: "#c2410c", label: "Orange" },
  { key: "lime", value: "#4d7c0f", label: "Lime" },
  { key: "rose", value: "#9d174d", label: "Rose" },
]

export const DEFAULT_CATEGORY_COLOR = "#7b1a1a"

export function getCategoryColor(value: string | null | undefined): string {
  return CATEGORY_COLORS.find((c) => c.key === value)?.value ?? DEFAULT_CATEGORY_COLOR
}

export function getCategoryColorHex(value: string | null | undefined): string {
  return getCategoryColor(value)
}
