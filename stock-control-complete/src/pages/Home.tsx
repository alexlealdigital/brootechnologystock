import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, TrendingDown, TrendingUp, DollarSign, LogOut, Wallet, BarChart3, ShieldCheck } from 'lucide-react'
import { Footer } from '@/components/ui/Footer'

interface Stats {
  totalProducts: number
  totalQuantity: number
  lowStock: number
  inventoryValue: number
  totalRevenue: number
  totalProfit: number
}

export default function Home() {
  const [, navigate] = useLocation()
  const { isLoaded, getStats } = useInventoryContext()
  const [stats, setStats] = useState<Stats>({ 
    totalProducts: 0, 
    totalQuantity: 0, 
    lowStock: 0, 
    inventoryValue: 0,
    totalRevenue: 0,
    totalProfit: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      const loadStats = async () => {
        try {
          setIsLoadingStats(true)
          const data = await getStats()
          setStats(data)
        } catch (err) {
          console.error('Erro ao carregar estatísticas:', err)
        } finally {
          setIsLoadingStats(false)
        }
      }
      loadStats()
    }
  }, [isLoaded, getStats])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!isLoaded || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Carregando Broo Stock...</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const profitMargin = stats.totalRevenue > 0 
    ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card/50 border-b border-border backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <ShieldCheck className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Poppins' }}>
              Broo <span className="text-primary">Stock</span>
            </h1>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut size={18} className="mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Grid - Indicadores de Estoque */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground/80">Indicadores de Estoque</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card/40 hover:bg-card/60 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Variedade no catálogo</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/40 hover:bg-card/60 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quantidade em Estoque</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalQuantity}</div>
                <p className="text-xs text-muted-foreground mt-1">Unidades totais disponíveis</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/40 hover:bg-card/60 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Baixo</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground mt-1">Produtos abaixo do mínimo</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/40 hover:bg-card/60 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor do Inventário</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.inventoryValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Investimento em mercadoria</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Grid - Indicadores Financeiros */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground/80">Indicadores Financeiros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Faturamento Total</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-primary/70 mt-1">Receita bruta de vendas</p>
              </CardContent>
            </Card>

            <Card className="bg-green-500/5 border-green-500/20 hover:bg-green-500/10 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-500">Lucro Estimado</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{formatCurrency(stats.totalProfit)}</div>
                <p className="text-xs text-green-500/70 mt-1">Resultado líquido bruto</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-500">Margem de Lucro</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{profitMargin}%</div>
                <p className="text-xs text-purple-500/70 mt-1">Rentabilidade do negócio</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Navigation Cards */}
        <section>
          <h2 className="text-lg font-semibold text-foreground/80 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:border-primary/50 transition-all cursor-pointer group bg-card/40" onClick={() => navigate('/products')}>
              <CardHeader>
                <Package className="h-8 w-8 text-primary group-hover:scale-110 transition-transform mb-2" />
                <CardTitle>Gerenciar Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Adicione, edite ou delete produtos do seu inventário de forma ágil.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-green-500/50 transition-all cursor-pointer group bg-card/40" onClick={() => navigate('/movements')}>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform mb-2" />
                <CardTitle>Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registre entradas e saídas e mantenha o controle em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-purple-500/50 transition-all cursor-pointer group bg-card/40" onClick={() => navigate('/reports')}>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform mb-2" />
                <CardTitle>Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize análises detalhadas e tome decisões baseadas em dados.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
