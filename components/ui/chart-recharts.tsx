'use client'

import { useId } from 'react'
import * as Recharts from 'recharts'

import { cn } from '@/lib/utils'
import { ChartContext, type ChartConfig } from './chart'

export function ChartContainerRecharts({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof Recharts.ResponsiveContainer>['children']
}) {
  const uniqueId = useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// Default-exports for next/dynamic in chart.tsx. The recharts class
// components are aliased to a function-component type so next/dynamic
// accepts them as defaults. The runtime behavior is identical (we just
// forward props to the real class component). The `as Record<string,
// unknown>` cast works around a recharts ref-type oddity when passing
// class-component props through a function component wrapper.
const ChartTooltipRecharts = (
  props: React.ComponentProps<typeof Recharts.Tooltip>,
) => <Recharts.Tooltip {...(props as unknown as Record<string, unknown>)} />
const ChartLegendRecharts = (
  props: React.ComponentProps<typeof Recharts.Legend>,
) => <Recharts.Legend {...(props as unknown as Record<string, unknown>)} />

export { ChartTooltipRecharts, ChartLegendRecharts }
