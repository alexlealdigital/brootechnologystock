/** Gráficos leves em SVG/CSS — sem dependência externa. */

export interface DonutSlice {
  label: string
  value: number
  color: string
}

export function DonutChart({ data, size = 150, thickness = 18 }: { data: DonutSlice[]; size?: number; thickness?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={thickness} opacity={0.4} />
      {total > 0 && data.map((d, i) => {
        const frac = d.value / total
        const dash = frac * c
        const seg = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          >
            <title>{`${d.label}: ${frac > 0 ? (frac * 100).toFixed(0) : 0}%`}</title>
          </circle>
        )
        offset += dash
        return seg
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: 18, fontWeight: 700 }}>
        {data.length}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
        métodos
      </text>
    </svg>
  )
}

export interface TrendPoint {
  label: string
  value: number
  value2?: number
}

export function AreaTrend({ data, height = 180 }: { data: TrendPoint[]; height?: number }) {
  const W = 520
  const H = height
  const pad = { t: 14, r: 10, b: 22, l: 10 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b

  const max = Math.max(1, ...data.map(d => Math.max(d.value, d.value2 ?? 0)))
  const n = data.length

  const x = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => pad.t + innerH - (v / max) * innerH

  const linePath = (key: 'value' | 'value2') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y((d[key] as number) || 0).toFixed(1)}`).join(' ')

  const areaPath = `${linePath('value')} L ${x(n - 1).toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`
  const hasSecond = data.some(d => typeof d.value2 === 'number')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {data.length > 0 && (
        <>
          <path d={areaPath} fill="url(#areaFill)" />
          <path d={linePath('value')} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinejoin="round" />
          {hasSecond && (
            <path d={linePath('value2')} fill="none" stroke="#4ade80" strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
          )}
          {data.map((d, i) => (
            <circle key={i} cx={x(i)} cy={y(d.value)} r={3} fill="hsl(var(--primary))">
              <title>{`${d.label}: ${d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</title>
            </circle>
          ))}
        </>
      )}
    </svg>
  )
}

/** Comparação direta Faturamento × Lucro — usada quando ainda não há
 *  histórico suficiente (menos de 2 dias) para um gráfico de tendência. */
export function CompareBars({ revenue, profit }: { revenue: number; profit: number }) {
  const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const max = Math.max(revenue, profit, 1)
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{brl(value)}</span>
      </div>
      <div className="h-3.5 rounded-full bg-secondary/40 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )

  return (
    <div className="space-y-5 py-6">
      <Bar label="Faturamento" value={revenue} color="hsl(var(--primary))" />
      <Bar label="Lucro Líquido" value={profit} color="#4ade80" />
      <p className="text-xs text-muted-foreground pt-1">
        Margem de <span className="text-foreground font-medium">{margin.toFixed(1)}%</span> — de cada R$ 100 vendidos, sobram R$ {margin.toFixed(2)} de lucro.
        <br />Registre vendas em dias diferentes para ver a evolução no tempo.
      </p>
    </div>
  )
}
