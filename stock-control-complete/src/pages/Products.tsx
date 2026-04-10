import { useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Pen, Plus, Trash2, X, ArrowLeft } from 'lucide-react'

export default function Products() {
  const [, navigate] = useLocation()
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useInventoryContext()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 0,
    min_quantity: 0,
    max_quantity: 100,
    unit_price: 0,
    cost_price: 0,
    category: '',
  })

  const handleOpenModal = (product?: typeof products[0]) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        min_quantity: product.min_quantity,
        max_quantity: product.max_quantity,
        unit_price: product.unit_price,
        cost_price: product.cost_price || 0,
        category: product.category || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        sku: '',
        quantity: 0,
        min_quantity: 0,
        max_quantity: 100,
        unit_price: 0,
        cost_price: 0,
        category: '',
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
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await deleteProduct(id)
      } catch (error) {
        alert('Erro ao deletar produto')
      }
    }
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="ghost" size="sm">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
              Gerenciar Produtos
            </h1>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus size={18} className="mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Categoria</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Quantidade</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Preço Venda</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Preço Custo</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhum produto cadastrado
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                        index % 2 === 0 ? 'bg-background' : 'bg-card'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                            product.quantity <= product.min_quantity
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        R$ {product.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        R$ {(product.cost_price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 hover:bg-secondary rounded transition-colors"
                          >
                            <Pen size={18} className="text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-secondary rounded transition-colors"
                          >
                            <Trash2 size={18} className="text-red-600" />
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome do produto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">SKU</label>
                  <Input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    placeholder="SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Categoria"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preço de Custo</label>
                  <Input
                    type="number"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preço de Venda</label>
                  <Input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Qtd Inicial</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mín.</label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Máx.</label>
                  <Input
                    type="number"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({ ...formData, max_quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
