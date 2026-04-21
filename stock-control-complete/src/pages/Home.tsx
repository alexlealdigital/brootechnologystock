import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TrendingUp, Wallet, BarChart3, Settings, X, Percent, Package, ShoppingBag, PieChart, Users } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export default function Home() {
  const [, navigate] = useLocation()
  const { isLoaded, getStats, movements, products, paymentSettings, updatePaymentSettings } = useInventoryContext()
  const [stats, setStats] = useState<any>({
    totalRevenue: 0, totalFees: 0, totalProfit: 0, totalProducts: 0, totalQuantity: 0,
    lowStock: 0, inventoryValue: 0, ticketMedio: 0, weightedFeeRate: 0,
    topProductsByVolume: [], topProductsByProfit: [], paymentMethodsDist: {}
  })
  const [showSettings, setShowSettings] = useState(false)
  const [fees, setFees] = useState<any>({ credito: 0, debito: 0, pix: 0, boleto: 0 })

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

  if (!isLoaded) return <div className="min-h-screen bg-background p-6 flex items-center justify-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Broo <span className="text-primary">Stock</span> <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-2">PRO</span></h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm"><Settings size={18} className="mr-2" /> Taxas</Button>
        </div>
      </div>

      {/* Linha 1: Financeiro Resumido */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wallet size={20} className="text-primary" /> Financeiro Executivo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Faturamento" value={formatCurrency(stats.totalRevenue)} icon={<Wallet className="text-primary" />} />
        <StatCard title="Lucro Líquido" value={formatCurrency(stats.totalProfit)} icon={<BarChart3 className="text-green-500" />} color="text-green-500" />
        <StatCard title="Margem" value={`${stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%`} icon={<TrendingUp className="text-purple-500" />} />
        <StatCard title="Valor Estoque" value={formatCurrency(stats.inventoryValue)} icon={<Package className="text-blue-500" />} />
        <StatCard title="Ticket Médio" value={formatCurrency(stats.ticketMedio)} icon={<ShoppingBag className="text-orange-500" />} />
        <StatCard title="Taxa Média" value={`${(stats.weightedFeeRate || 0).toFixed(2)}%`} icon={<Percent className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Top Produtos por Lucro */}
        <Card className="p-6">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Top 5 Produtos Mais Lucrativos</h3>
          <div className="space-y-4">
            {stats.topProductsByProfit.length > 0 ? stats.topProductsByProfit.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(p.profit)}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>}
          </div>
        </Card>

        {/* Distribuição por Pagamento */}
        <Card className="p-6">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2"><PieChart size={18} className="text-primary" /> Vendas por Meio de Pagamento</h3>
          <div className="space-y-4">
            {Object.entries(stats.paymentMethodsDist).length > 0 ? Object.entries(stats.paymentMethodsDist).map(([method, value]: any) => (
              <div key={method} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize">{method}</span>
                  <span>{formatCurrency(value)}</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${(value / stats.totalRevenue) * 100}%` }}></div>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button onClick={() => navigate('/products')} className="h-24 text-lg flex flex-col gap-1"><Package /> Produtos</Button>
        <Button onClick={() => navigate('/movements')} className="h-24 text-lg flex flex-col gap-1"><TrendingUp /> Movimentações</Button>
        <Button onClick={() => navigate('/reports')} className="h-24 text-lg flex flex-col gap-1"><BarChart3 /> Relatórios</Button>
      </div>

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
