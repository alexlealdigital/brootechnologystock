import { useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, X, ArrowLeft, Pen, Trash2, Package, Search, ShieldCheck } from 'lucide-react'
import { Footer } from '@/components/ui/Footer'

export default function Products() {
  const [, navigate] = useLocation()
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useInventoryContext()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    min_quantity: 5,
    max_quantity: 100,
    unit_price: 0,
    cost_price: 0,
  })

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (product?: typeof products[0]) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        quantity: product.quantity,
        min_quantity: product.min_quantity,
        max_quantity: product.max_quantity,
        unit_price: product.unit_price,
        cost_price: product.cost_price || 0,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        min_quantity: 5,
        max_quantity: 100,
        unit_price: 0,
        cost_price: 0,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, formData)
      } else {
        await addProduct(formData)
      }
      setShowModal(false)
      setEditingId(null)
    } catch (error) {
      alert('Erro ao salvar produto')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id)
      } catch (error) {
        alert('Erro ao excluir produto')
      }
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Carregando catálogo...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card/50 border-b border-border backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary h-6 w-6" />
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
                Broo <span className="text-primary">Stock</span>
              </h1>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus size={18} className="mr-2" />
            Novo Produto
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Gerenciamento de Produtos</h2>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou SKU..." 
              className="pl-10 bg-card/40 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">SKU / Cat.</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Qtd.</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Custo (R$)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Venda (R$)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category || 'Sem categoria'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{product.sku}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${product.quantity <= product.min_quantity ? 'text-destructive' : 'text-foreground'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                        {product.cost_price ? `R$ ${product.cost_price.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-foreground">
                        R$ {product.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors group"
                          >
                            <Pen size={18} className="text-primary group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                          >
                            <Trash2 size={18} className="text-destructive group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-lg shadow-2xl border-border/50 bg-card">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Nome do Produto</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Camiseta Premium"
                    required
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">SKU</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="REF-001"
                    required
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Categoria</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Vestuário"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Preço Custo</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Preço Venda</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Qtd Inicial</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    disabled={!!editingId}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Mín. Alerta</label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Máx. Sugerido</label>
                  <Input
                    type="number"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({ ...formData, max_quantity: parseInt(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
