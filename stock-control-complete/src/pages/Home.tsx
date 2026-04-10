import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, TrendingDown, TrendingUp, DollarSign, LogOut, Wallet, BarChart3 } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
            Controle de Estoque
          </h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut size={18} className="mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Primeira linha: Indicadores de Estoque */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Indicadores de Estoque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quantidade em Estoque</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuantity}</div>
                <p className="text-xs text-muted-foreground">Unidades disponíveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground">Produtos abaixo do mínimo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor do Inventário</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.inventoryValue)}</div>
                <p className="text-xs text-muted-foreground">Custo total dos produtos</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Grid - Segunda linha: Indicadores Financeiros */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Indicadores Financeiros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Faturamento Total</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Total em vendas realizadas</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Lucro Estimado</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(stats.totalProfit)}</div>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">Lucro bruto sobre as vendas</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Margem de Lucro</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{profitMargin}%</div>
                <p className="text-xs text-purple-600/80 dark:text-purple-400/80">Percentual de lucro sobre faturamento</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
              <CardHeader>
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Gerenciar Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Adicione, edite ou delete produtos do seu inventário
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/movements')}>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registre entradas e saídas de produtos
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize análises e relatórios do seu estoque
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
