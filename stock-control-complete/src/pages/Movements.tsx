import { useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, X, ArrowLeft } from 'lucide-react'

export default function Movements() {
  const [, navigate] = useLocation()
  const { products, movements, addMovement, isLoaded } = useInventoryContext()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'entrada' as 'entrada' | 'saida',
    quantity: 0,
    reason: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addMovement({
        ...formData,
        product_id: formData.product_id,
        date: new Date().toISOString(),
      })
      setShowModal(false)
      setFormData({
        product_id: '',
        type: 'entrada',
        quantity: 0,
        reason: '',
        notes: '',
      })
    } catch (error) {
      alert('Erro ao registrar movimentação')
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
          <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
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
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('pt-BR')}
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
                Nova Movimentação
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
                <label className="block text-sm font-medium text-foreground mb-2">Produto</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Selecione um produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

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
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Registrar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
