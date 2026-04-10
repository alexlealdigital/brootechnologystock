import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft } from 'lucide-react'

export default function Reports() {
  const [, navigate] = useLocation()
  const { products, isLoaded } = useInventoryContext()
  const [lowStock, setLowStock] = useState<any[]>([])
  const [overstocked, setOverstocked] = useState<any[]>([])

  useEffect(() => {
    if (isLoaded) {
      const low = products.filter(p => p.quantity <= p.min_quantity)
      const over = products.filter(p => p.quantity > p.max_quantity)
      setLowStock(low)
      setOverstocked(over)
    }
  }, [products, isLoaded])

  if (!isLoaded) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
            Relatórios
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Low Stock */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Poppins' }}>
            Produtos com Estoque Baixo
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">SKU</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Quantidade</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Mínimo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Falta</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum produto com estoque baixo
                      </td>
                    </tr>
                  ) : (
                    lowStock.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                          index % 2 === 0 ? 'bg-background' : 'bg-card'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">{product.quantity}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{product.min_quantity}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                          {product.min_quantity - product.quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Overstocked */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Poppins' }}>
            Produtos com Estoque Acima do Máximo
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">SKU</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Quantidade</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Máximo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Excesso</th>
                  </tr>
                </thead>
                <tbody>
                  {overstocked.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum produto com estoque acima do máximo
                      </td>
                    </tr>
                  ) : (
                    overstocked.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                          index % 2 === 0 ? 'bg-background' : 'bg-card'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
                        <td className="px-6 py-4 text-sm text-right text-orange-600 font-medium">{product.quantity}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{product.max_quantity}</td>
                        <td className="px-6 py-4 text-sm text-right text-orange-600 font-medium">
                          {product.quantity - product.max_quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
