import { useEffect, useState } from 'react'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AppShell } from '@/components/AppShell'
import {
  TrendingUp, Wallet, BarChart3, Settings, X, Package,
  Image as ImageIcon, AlertTriangle, Users, Store, Trash2, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { InstallPWA } from '@/components/InstallPWA'

export default function Home() {
  const {
    isLoaded, getStats, movements, products, paymentSettings, updatePaymentSettings,
    entities, channels, addEntity, deleteEntity, addChannel, deleteChannel,
  } = useInventoryContext()
  const [stats, setStats] = useState<any>({
    totalRevenue: 0, totalFees: 0, totalProfit: 0, inventoryValue: 0, ticketMedio: 0,
    topProductsByProfit: [], lowStockList: [],
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showManageModal, setShowManageModal] = useState<'entities' | 'channels' | null>(null)
  const [fees, setFees] = useState<any>({ credito: 0, debito: 0, pix: 0, boleto: 0 })
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')

  useEffect(() => {
    if (isLoaded) {
      getStats().then(setStats)
    }
  }, [isLoaded, movements, products, paymentSettings, getStats])

  useEffect(() => {
    if (paymentSettings.length > 0) {
      const newFees = { credito: 0, debito: 0, pix: 0, boleto: 0 }
      paymentSettings.forEach(s => { if (s.method_name in newFees) newFees[s.method_name as keyof typeof newFees] = s.fee_percentage })
      setFees(newFees)
    }
  }, [paymentSettings])

  const formatCurrency = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const productName = (id: string) => products.find((p: any) => p.id === id)?.name || 'Produto'

  const recentMovements = [...movements]
    .sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
    .slice(0, 6)

  const handleAddManage = async () => {
    if (!newName) return
    if (showManageModal === 'entities') {
      await addEntity({ name: newName, type: newType || 'cliente' })
    } else {
      await addChannel({ name: newName, type: 'online' })
    }
    setNewName('')
    setNewType('')
  }

  if (!isLoaded) {
    return (
      <AppShell title="Painel">
        <p className="text-muted-foreground">Carregando...</p>
      </AppShell>
    )
  }

  const actions = (
    <>
      <InstallPWA />
      <Button onClick={() => setShowManageModal('channels')} variant="outline" size="sm" className="border-primary text-primary hidden sm:inline-flex"><Store size={16} className="mr-2" /> Canais</Button>
      <Button onClick={() => setShowManageModal('entities')} variant="outline" size="sm" className="border-primary text-primary hidden sm:inline-flex"><Users size={16} className="mr-2" /> Entidades</Button>
      <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm"><Settings size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Taxas</span></Button>
    </>
  )

  return (
    <AppShell title="Painel Financeiro" actions={actions}>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Faturamento" value={formatCurrency(stats.totalRevenue)} icon={<Wallet className="text-primary" size={18} />} />
        <StatCard title="Lucro Líquido" value={formatCurrency(stats.totalProfit)} icon={<BarChart3 className="text-green-500" size={18} />} color="text-green-500" />
        <StatCard title="Margem" value={`${stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%`} icon={<TrendingUp className="text-purple-500" size={18} />} />
        <StatCard title="Valor Estoque" value={formatCurrency(stats.inventoryValue)} icon={<Package className="text-blue-500" size={18} />} />
      </div>

      {/* Painéis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-green-500"><TrendingUp size={18} /> Top 5 Produtos Mais Lucrativos</h3>
          <div className="space-y-3">
            {stats.topProductsByProfit.length > 0 ? stats.topProductsByProfit.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center overflow-hidden shrink-0">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-muted-foreground" />}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[150px]">{p.name}</span>
                </div>
                <span className="text-sm font-bold text-green-600">{formatCurrency(p.profit)}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">Sem dados de lucro ainda.</p>}
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
                {stats.lowStockList.length > 0 ? stats.lowStockList.map((p: any) => (
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
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
        )}
      </Card>

      {/* Modal de Canais/Entidades */}
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

function StatCard({ title, value, icon, color = "" }: any) {
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</span>
        {icon}
      </div>
      <div className={`text-lg font-bold truncate ${color}`}>{value}</div>
    </Card>
  )
}
