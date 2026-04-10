import { useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, X, ArrowLeft, Pen, Trash2, TrendingUp, ShieldCheck } from 'lucide-react'
import { Footer } from '@/components/ui/Footer'

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
        // @ts-ignore
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
        // @ts-ignore
        await deleteMovement(id)
      } catch (error) {
        alert('Erro ao excluir movimentação')
      }
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Carregando movimentações...</p>
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
            Nova Movimentação
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Registro de Movimentações</h2>
        </div>

        <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tipo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Qtd.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Motivo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Venda (R$)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma movimentação registrada
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => {
                    const product = products.find(p => p.id === movement.product_id)
                    return (
                      <tr key={movement.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{product?.name}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                              movement.type === 'entrada'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-destructive/10 text-destructive border border-destructive/20'
                            }`}
                          >
                            {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-foreground font-mono">{movement.quantity}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{movement.reason}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground font-medium">
                          {movement.sale_price ? `R$ ${movement.sale_price.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleOpenModal(movement)}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors group"
                            >
                              <Pen size={18} className="text-primary group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDelete(movement.id)}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                            >
                              <Trash2 size={18} className="text-destructive group-hover:scale-110 transition-transform" />
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
      </main>

      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? 'Editar Movimentação' : 'Nova Movimentação'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingId(null)
                }}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Produto</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
                >
                  <option value="">Selecione um produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida' })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Quantidade</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Motivo</label>
                <Input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ex: Compra, Venda, Devolução"
                  required
                  className="bg-background/50"
                />
              </div>

              {formData.type === 'saida' && (
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Preço de Venda (R$)</label>
                  <Input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="bg-background/50 border-primary/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all"
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
                  variant="ghost" 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
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
