export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl text-pretty">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
