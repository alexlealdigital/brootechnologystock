import { useEffect, useMemo, useState } from 'react'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { AppShell } from '@/components/AppShell'
import { InstallPWA } from '@/components/InstallPWA'
import { InfoHint } from '@/components/ui/Hints'
import { DonutChart, AreaTrend } from '@/components/Charts'
import {
  TrendingUp, Wallet, BarChart3, Settings, X, Package, Image as ImageIcon,
  AlertTriangle, Users, Store, Trash2, ArrowDownLeft, ArrowUpRight, CreditCard,
} from 'lucide-react'

type Period = 'hoje' | '7d' | '30d' | 'mes' | 'tudo'
const PERIODS: { k: Period; label: string }[] = [
  { k: 'hoje', label: 'Hoje' },
  { k: '7d', label: '7 dias' },
  { k: '30d', label: '30 dias' },
  { k: 'mes', label: 'Mês' },
  { k: 'tudo', label: 'Tudo' },
]

const PAY_META: Record<string, { label: string; color: string }> = {
  pix: { label: 'PIX', color: '#22c55e' },
  credito: { label: 'Crédito', color: '#3b82f6' },
  debito: { label: 'Débito', color: '#a855f7' },
  boleto: { label: 'Boleto', color: '#f59e0b' },
  outro: { label: 'Outro', color: '#64748b' },
}

export default function Home() {
  const {
    isLoaded, movements, products, paymentSettings, updatePaymentSettings,
    entities, channels, addEntity, deleteEntity, addChannel, deleteChannel,
  } = useInventoryContext()

  const [period, setPeriod] = useState<Period>('30d')
  const [showSettings, setShowSettings] = useState(false)
  const [showManageModal, setShowManageModal] = useState<'entities' | 'channels' | null>(null)
  const [fees, setFees] = useState<any>({ credito: 0, debito: 0, pix: 0, boleto: 0 })
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')

  useEffect(() => {
    if (paymentSettings.length > 0) {
      const nf = { credito: 0, debito: 0, pix: 0, boleto: 0 }
      paymentSettings.forEach(s => { if (s.method_name in nf) nf[s.method_name as keyof typeof nf] = s.fee_percentage })
      setFees(nf)
    }
  }, [paymentSettings])

  const brl = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const productName = (id: string) => products.find((p: any) => p.id === id)?.name || 'Produto'

  // ===== Cálculos do período =====
  const stats = useMemo(() => {
    const now = new Date()
    const inPeriod = (s?: string) => {
      if (!s) return false
      const d = new Date(s)
      if (period === 'tudo') return true
      if (period === 'hoje') return d.toDateString() === now.toDateString()
      if (period === 'mes') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      const days = period === '7d' ? 7 : 30
      const cutoff = new Date(now); cutoff.setDate(now.getDate() - days); cutoff.setHours(0, 0, 0, 0)
      return d >= cutoff
    }

    const sales = movements.filter((m: any) => m.type === 'saida' && m.reason === 'venda' && inPeriod(m.date || m.created_at))
    const costOf = (m: any) => ((products.find((p: any) => p.id === m.product_id)?.cost_price || 0) * m.quantity)

    const revenue = sales.reduce((s: number, m: any) => s + m.quantity * (m.sale_price || 0), 0)
    const feesTotal = sales.reduce((s: number, m: any) => s + (m.fee_amount || 0), 0)
    const profit = sales.reduce((s: number, m: any) => s + (m.quantity * (m.sale_price || 0)) - costOf(m) - (m.fee_amount || 0), 0)
    const ticket = sales.length > 0 ? revenue / sales.length : 0
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    const inventoryValue = products.reduce((s: number, p: any) => s + (p.quantity * (p.cost_price || 0)), 0)

    // Top produtos por lucro
    const byProd: any = {}
    sales.forEach((m: any) => {
      const p = products.find((x: any) => x.id === m.product_id)
      const k = m.product_id
      if (!byProd[k]) byProd[k] = { name: p?.name || 'Desconhecido', image_url: p?.image_url, profit: 0 }
      byProd[k].profit += (m.quantity * (m.sale_price || 0)) - costOf(m) - (m.fee_amount || 0)
    })
    const topProducts = Object.values(byProd).sort((a: any, b: any) => b.profit - a.profit).slice(0, 5)

    // Mix de pagamento
    const payMap: any = {}
    sales.forEach((m: any) => {
      const k = m.payment_method || 'outro'
      if (!payMap[k]) payMap[k] = { revenue: 0, fees: 0, count: 0 }
      payMap[k].revenue += m.quantity * (m.sale_price || 0)
      payMap[k].fees += m.fee_amount || 0
      payMap[k].count += 1
    })
    const payList = Object.entries(payMap)
      .map(([k, v]: any) => ({ key: k, ...PAY_META[k] || PAY_META.outro, ...v }))
      .sort((a, b) => b.revenue - a.revenue)

    // Tendência diária (faturamento × lucro)
    const dayMap = new Map<string, { revenue: number; profit: number }>()
    sales.forEach((m: any) => {
      const dt = new Date(m.date || m.created_at)
      const key = dt.toISOString().slice(0, 10)
      const cur = dayMap.get(key) || { revenue: 0, profit: 0 }
      cur.revenue += m.quantity * (m.sale_price || 0)
      cur.profit += (m.quantity * (m.sale_price || 0)) - costOf(m) - (m.fee_amount || 0)
      dayMap.set(key, cur)
    })
    const trend = [...dayMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([k, v]) => ({ label: new Date(k).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: v.revenue, value2: v.profit }))

    const lowStock = products.filter((p: any) => p.quantity <= p.min_quantity).sort((a: any, b: any) => a.quantity - b.quantity)

    return { sales, revenue, feesTotal, profit, ticket, margin, inventoryValue, topProducts, payList, trend, lowStock, count: sales.length }
  }, [movements, products, period])

  const recentMovements = useMemo(() =>
    [...movements].sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()).slice(0, 6),
    [movements])

  const handleAddManage = async () => {
    if (!newName) return
    if (showManageModal === 'entities') await addEntity({ name: newName, type: newType || 'cliente' })
    else await addChannel({ name: newName, type: 'online' })
    setNewName(''); setNewType('')
  }

  if (!isLoaded) {
    return <AppShell title="Painel"><p className="text-muted-foreground">Carregando...</p></AppShell>
  }

  const actions = (
    <>
      <InstallPWA />
      <Button onClick={() => setShowManageModal('channels')} variant="outline" size="sm" className="border-primary text-primary hidden sm:inline-flex"><Store size={16} className="mr-2" /> Canais</Button>
      <Button onClick={() => setShowManageModal('entities')} variant="outline" size="sm" className="border-primary text-primary hidden sm:inline-flex"><Users size={16} className="mr-2" /> Entidades</Button>
      <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm"><Settings size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Taxas</span></Button>
    </>
  )

  const semVendas = stats.count === 0

  return (
    <AppShell title="Painel Financeiro" actions={actions}>
      {/* Filtro de período */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {PERIODS.map(p => (
          <button
            key={p.k}
            onClick={() => setPeriod(p.k)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${period === p.k ? 'bg-primary text-primary-foreground' : 'bg-card/50 text-muted-foreground hover:text-foreground border border-border/50'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Faturamento" value={brl(stats.revenue)} icon={<Wallet className="text-primary" size={18} />} hint="Soma das suas vendas no período (preço × quantidade)." />
        <StatCard title="Lucro Líquido" value={brl(stats.profit)} icon={<BarChart3 className="text-green-500" size={18} />} color="text-green-500" hint="O que sobra de fato: vendas − custo dos produtos − taxas de pagamento." />
        <StatCard title="Margem" value={`${stats.margin.toFixed(1)}%`} icon={<TrendingUp className="text-purple-500" size={18} />} hint="Quanto do faturamento virou lucro (lucro ÷ faturamento)." />
        <StatCard title="Valor Estoque" value={brl(stats.inventoryValue)} icon={<Package className="text-blue-500" size={18} />} hint="Quanto você tem investido em estoque, pelo custo dos produtos." />
      </div>

      {semVendas ? (
        <Card className="p-8 text-center mb-6">
          <TrendingUp className="mx-auto text-muted-foreground mb-3" size={28} />
          <p className="font-semibold">Sem vendas neste período</p>
          <p className="text-sm text-muted-foreground mt-1">Registre uma movimentação de venda ou troque o período acima para ver seus números.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tendência */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-bold flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Faturamento × Lucro</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block" /> Faturamento</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0 border-t-2 border-dashed border-green-400 inline-block" /> Lucro</span>
              </div>
            </div>
            <AreaTrend data={stats.trend} />
          </Card>

          {/* Mix de pagamento */}
          <Card className="p-6">
            <h3 className="text-md font-bold mb-3 flex items-center gap-2"><CreditCard size={18} className="text-primary" /> Meios de Pagamento</h3>
            <div className="flex justify-center mb-4">
              <DonutChart data={stats.payList.map(p => ({ label: p.label, value: p.revenue, color: p.color }))} />
            </div>
            <div className="space-y-2">
              {stats.payList.map(p => (
                <div key={p.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} /> {p.label}</span>
                  <span className="text-right">
                    <span className="font-medium">{brl(p.revenue)}</span>
                    {p.fees > 0 && <span className="text-xs text-red-400 ml-2">−{brl(p.fees)} taxa</span>}
                  </span>
                </div>
              ))}
            </div>
            {stats.feesTotal > 0 && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/40">
                Total pago em taxas no período: <span className="text-red-400 font-medium">{brl(stats.feesTotal)}</span>
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Top produtos + Estoque baixo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-green-500"><TrendingUp size={18} /> Top Produtos Mais Lucrativos</h3>
          <div className="space-y-3">
            {stats.topProducts.length > 0 ? stats.topProducts.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center overflow-hidden shrink-0">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-muted-foreground" />}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[150px]">{p.name}</span>
                </div>
                <span className="text-sm font-bold text-green-600">{brl(p.profit)}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">Sem dados de lucro neste período.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-red-500"><AlertTriangle size={18} /> Produtos com Estoque Baixo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="pb-2 font-medium">Produto</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium text-center">Qtd</th>
                  <th className="pb-2 font-medium text-center">Mín</th>
                  <th className="pb-2 font-medium text-right">Falta</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStock.length > 0 ? stats.lowStock.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/30 last:border-0">
                    <td className="py-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center overflow-hidden shrink-0">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={10} className="text-muted-foreground" />}
                      </div>
                      <span className="truncate max-w-[100px]">{p.name}</span>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{p.sku}</td>
                    <td className="py-2 text-center font-bold text-red-500">{p.quantity}</td>
                    <td className="py-2 text-center">{p.min_quantity}</td>
                    <td className="py-2 text-right text-red-400 font-medium">{p.min_quantity - p.quantity}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Estoque em dia!</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Movimentações recentes */}
      <Card className="p-6">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Movimentações Recentes</h3>
        {recentMovements.length > 0 ? (
          <div className="divide-y divide-border/40">
            {recentMovements.map((m: any) => {
              const entrada = m.type === 'entrada'
              return (
                <div key={m.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entrada ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'}`}>
                      {entrada ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{productName(m.product_id)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.reason} · {entrada ? 'entrada' : 'saída'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${entrada ? 'text-green-500' : 'text-red-400'}`}>{entrada ? '+' : '-'}{m.quantity}</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.created_at || m.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</p>}
      </Card>

      {/* Modal Canais/Entidades */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button onClick={() => setShowManageModal(null)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-4">Gerenciar {showManageModal === 'entities' ? 'Entidades' : 'Canais'}</h3>
            <div className="space-y-3 mb-4">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome..." />
              {showManageModal === 'entities' && (
                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full p-2 border border-input rounded bg-background text-sm">
                  <option value="cliente">Cliente</option>
                  <option value="fornecedor">Fornecedor</option>
                  <option value="representante">Representante</option>
                </select>
              )}
              <Button onClick={handleAddManage} className="w-full">Adicionar</Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {(showManageModal === 'entities' ? entities : channels).map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.type && <span className="text-[10px] uppercase text-muted-foreground">{item.type}</span>}
                  </div>
                  <button onClick={() => showManageModal === 'entities' ? deleteEntity(item.id) : deleteChannel(item.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-sm p-6 relative bg-card">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-4">Taxas Operacionais (%)</h3>
            {Object.entries(fees).map(([name, val]: any) => (
              <div key={name} className="mb-3">
                <label className="block text-sm capitalize mb-1">{name}</label>
                <Input type="number" step="0.01" value={val} onChange={e => setFees({ ...fees, [name]: parseFloat(e.target.value) || 0 })} />
              </div>
            ))}
            <Button onClick={async () => { await updatePaymentSettings(Object.entries(fees).map(([n, v]) => ({ method_name: n, fee_percentage: v }))); setShowSettings(false); }} className="w-full mt-4">Salvar</Button>
          </Card>
        </div>
      )}
    </AppShell>
  )
}

function StatCard({ title, value, icon, color = '', hint }: any) {
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          {title} {hint && <InfoHint text={hint} />}
        </span>
        {icon}
      </div>
      <div className={`text-lg font-bold truncate ${color}`}>{value}</div>
    </Card>
  )
}
