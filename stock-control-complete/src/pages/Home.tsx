import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TrendingUp, Wallet, BarChart3, Settings, X, Percent, Package, ShoppingBag, Image as ImageIcon, AlertTriangle, Users, Store } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export default function Home() {
  const [, navigate] = useLocation()
  const { isLoaded, getStats, movements, products, paymentSettings, updatePaymentSettings, entities, channels, addEntity, deleteEntity, addChannel, deleteChannel } = useInventoryContext()
  const [stats, setStats] = useState<any>({
    totalRevenue: 0, totalFees: 0, totalProfit: 0, inventoryValue: 0, ticketMedio: 0,
    topProductsByProfit: [], lowStockList: []
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showManageModal, setShowManageModal] = useState<'entities' | 'channels' | null>(null)
  const [fees, setFees] = useState<any>({ credito: 0, debito: 0, pix: 0, boleto: 0 })
  
  // States para novos cadastros
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

  if (!isLoaded) return <div className="min-h-screen bg-background p-6 flex items-center justify-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Broo <span className="text-primary">Stock</span> <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-2">PRO</span></h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowManageModal('channels')} variant="outline" size="sm" className="border-primary text-primary"><Store size={16} className="mr-2" /> Canais</Button>
          <Button onClick={() => setShowManageModal('entities')} variant="outline" size="sm" className="border-primary text-primary"><Users size={16} className="mr-2" /> Entidades</Button>
          <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm"><Settings size={18} className="mr-2" /> Taxas</Button>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wallet size={20} className="text-primary" /> Financeiro Executivo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Faturamento" value={formatCurrency(stats.totalRevenue)} icon={<Wallet className="text-primary" />} />
        <StatCard title="Lucro Líquido" value={formatCurrency(stats.totalProfit)} icon={<BarChart3 className="text-green-500" />} color="text-green-500" />
        <StatCard title="Margem" value={`${stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%`} icon={<TrendingUp className="text-purple-500" />} />
        <StatCard title="Valor Estoque" value={formatCurrency(stats.inventoryValue)} icon={<Package className="text-blue-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
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
            )) : <p className="text-sm text-muted-foreground">Sem dados de lucro.</p>}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button onClick={() => navigate('/products')} className="h-24 text-lg flex flex-col gap-1"><Package /> Produtos</Button>
        <Button onClick={() => navigate('/movements')} className="h-24 text-lg flex flex-col gap-1"><TrendingUp /> Movimentações</Button>
        <Button onClick={() => navigate('/reports')} className="h-24 text-lg flex flex-col gap-1"><BarChart3 /> Relatórios</Button>
      </div>

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
                <Input type="number" step="0.01" value={val} onChange={e => setFees({...fees, [name]: parseFloat(e.target.value) || 0})} />
              </div>
            ))}
            <Button onClick={async () => { await updatePaymentSettings(Object.entries(fees).map(([n, v]) => ({method_name: n, fee_percentage: v}))); setShowSettings(false); }} className="w-full mt-4">Salvar</Button>
          </Card>
        </div>
      )}
    </div>
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
