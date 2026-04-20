import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3, Settings, X, Percent } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export default function Home() {
  const [, navigate] = useLocation()
  const { isLoaded, getStats, movements, products, paymentSettings, updatePaymentSettings } = useInventoryContext()
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalFees: 0,
    totalProfit: 0,
    totalProducts: 0,
    totalQuantity: 0,
    lowStock: 0,
    inventoryValue: 0
  })
  const [showSettings, setShowSettings] = useState(false)
  const [fees, setFees] = useState<any>({ credito: 0, debito: 0, pix: 0, boleto: 0 })

  // Atualizar stats sempre que movements, products ou paymentSettings mudarem
  useEffect(() => {
    if (isLoaded) {
      getStats().then(newStats => {
        setStats(newStats || {
          totalRevenue: 0,
          totalFees: 0,
          totalProfit: 0,
          totalProducts: 0,
          totalQuantity: 0,
          lowStock: 0,
          inventoryValue: 0
        })
      })
    }
  }, [isLoaded, movements, products, paymentSettings, getStats])

  // Atualizar taxas quando paymentSettings mudarem
  useEffect(() => {
    if (paymentSettings.length > 0) {
      const newFees = { credito: 0, debito: 0, pix: 0, boleto: 0 }
      paymentSettings.forEach(s => {
        if (s.method_name in newFees) {
          newFees[s.method_name as keyof typeof newFees] = s.fee_percentage
        }
      })
      setFees(newFees)
    }
  }, [paymentSettings])

  const formatCurrency = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleSaveSettings = async () => {
    try {
      await updatePaymentSettings(Object.entries(fees).map(([n, v]) => ({
        method_name: n,
        fee_percentage: v
      })))
      setShowSettings(false)
    } catch (error) {
      alert('Erro ao salvar configurações de taxa')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Broo <span className="text-primary">Stock</span></h1>
        <Button onClick={() => setShowSettings(true)} variant="ghost"><Settings size={18} className="mr-2" /> Configurar Taxas</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Faturamento Bruto" 
          value={formatCurrency(stats.totalRevenue || 0)} 
          icon={<Wallet className="text-primary" />} 
        />
        <StatCard 
          title="Total Taxas" 
          value={formatCurrency(stats.totalFees || 0)} 
          icon={<Percent className="text-orange-500" />} 
          color="text-orange-500" 
        />
        <StatCard 
          title="Lucro Líquido" 
          value={formatCurrency(stats.totalProfit || 0)} 
          icon={<BarChart3 className="text-green-500" />} 
          color="text-green-500" 
        />
        <StatCard 
          title="Margem Líquida" 
          value={`${stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%`} 
          icon={<TrendingUp className="text-purple-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button onClick={() => navigate('/products')} className="h-24 text-lg">Produtos</Button>
        <Button onClick={() => navigate('/movements')} className="h-24 text-lg">Movimentações</Button>
        <Button onClick={() => navigate('/reports')} className="h-24 text-lg">Relatórios</Button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-sm p-6 relative bg-card">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-4">Taxas Operacionais (%)</h3>
            {Object.entries(fees).map(([name, val]: any) => (
              <div key={name} className="mb-3">
                <label className="block text-sm capitalize mb-1">{name}</label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={val} 
                  onChange={e => setFees({...fees, [name]: parseFloat(e.target.value) || 0})} 
                />
              </div>
            ))}
            <Button onClick={handleSaveSettings} className="w-full mt-4">Salvar</Button>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color = "" }: any) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </Card>
  )
}
