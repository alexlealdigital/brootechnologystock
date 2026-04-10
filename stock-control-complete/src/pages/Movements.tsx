import { useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, X, ArrowLeft, Pen, Trash2 } from 'lucide-react'

export default function Movements() {
  const [, navigate] = useLocation()
  const { products, movements, addMovement, updateMovement, deleteMovement, isLoaded } = useInventoryContext()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'entrada' as 'entrada' | 'saida',
    quantity: 0,
    reason: '',
    notes: '',
    sale_price: 0,
  })

  const handleOpenModal = (movement?: typeof movements[0]) => {
    if (movement) {
      setEditingId(movement.id)
      setFormData({
        product_id: movement.product_id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        notes: movement.notes || '',
        sale_price: movement.sale_price || 0,
      })
    } else {
      setEditingId(null)
      setFormData({
        product_id: '',
        type: 'entrada',
        quantity: 0,
        reason: '',
        notes: '',
        sale_price: 0,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const isVenda = formData.type === 'saida' && 
        (formData.reason.toLowerCase().includes('venda') || formData.reason.toLowerCase() === 'venda')

      const movementData = {
        ...formData,
        movement_reason: isVenda ? 'venda' : 'outro',
        sale_price: isVenda && formData.sale_price === 0 
          ? (products.find(p => p.id === formData.product_id)?.unit_price || 0)
          : formData.sale_price,
        date: editingId 
          ? movements.find(m => m.id === editingId)?.date 
          : new Date().toISOString()
      }

      if (editingId) {
        // @ts-ignore - updateMovement adicionado ao contexto
        await updateMovement(editingId, movementData)
      } else {
        await addMovement(movementData)
      }
      
      setShowModal(false)
      setEditingId(null)
    } catch (error) {
      alert('Erro ao salvar movimentação')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação? O estoque será recalculado automaticamente.')) {
      try {
        // @ts-ignore - deleteMovement adicionado ao contexto
        await deleteMovement(id)
      } catch (error) {
        alert('Erro ao excluir movimentação')
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
              Movimentações
            </h1>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus size={18} className="mr-2" />
            Nova Movimentação
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tipo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Quantidade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Motivo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Venda (R$)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhuma movimentação registrada
                    </td>
                  </tr>
                ) : (
                  movements.map((movement, index) => {
                    const product = products.find(p => p.id === movement.product_id)
                    return (
                      <tr
                        key={movement.id}
                        className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                          index % 2 === 0 ? 'bg-background' : 'bg-card'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{product?.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                              movement.type === 'entrada'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {movement.type === 'entrada' ? '↓ Entrada' : '↑ Saída'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{movement.quantity}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{movement.reason}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">
                          {movement.sale_price ? `R$ ${movement.sale_price.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleOpenModal(movement)}
                              className="p-2 hover:bg-secondary rounded transition-colors"
                            >
                              <Pen size={18} className="text-primary" />
                            </button>
                            <button
                              onClick={() => handleDelete(movement.id)}
                              className="p-2 hover:bg-secondary rounded transition-colors"
                            >
                              <Trash2 size={18} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
                {editingId ? 'Editar Movimentação' : 'Nova Movimentação'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingId(null)
                }}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Produto</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  disabled={!!editingId} // Evita mudar o produto em uma edição para manter a integridade simples
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50"
                >
                  <option value="">Selecione um produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida' })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Quantidade</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Motivo</label>
                <Input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ex: Compra, Venda, Devolução"
                  required
                />
              </div>

              {formData.type === 'saida' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preço de Venda (R$)</label>
                  <Input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {editingId ? 'Salvar Alterações' : 'Registrar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
