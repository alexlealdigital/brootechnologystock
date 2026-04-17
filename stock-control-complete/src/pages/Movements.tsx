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
    reason: 'compra' as 'compra' | 'venda' | 'devolucao',
    sale_channel: 'venda_local' as 'venda_local' | 'representante' | 'distribuidor',
    payment_method: 'credito' as 'credito' | 'debito' | 'pix' | 'boleto',
    notes: '',
    sale_price: 0,
  })

  const handleOpenModal = (movement?: any) => {
    if (movement) {
      setEditingId(movement.id)
      setFormData({
        product_id: movement.product_id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason || 'compra',
        sale_channel: movement.sale_channel || 'venda_local',
        payment_method: movement.payment_method || 'credito',
        notes: movement.notes || '',
        sale_price: movement.sale_price || 0,
      })
    } else {
      setEditingId(null)
      setFormData({
        product_id: '',
        type: 'entrada',
        quantity: 0,
        reason: 'compra',
        sale_channel: 'venda_local',
        payment_method: 'credito',
        notes: '',
        sale_price: 0,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const isVenda = formData.type === 'saida' && formData.reason === 'venda'
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

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card/50 border-b border-border backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="ghost" size="sm"><ArrowLeft size={18} /></Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary h-6 w-6" />
              <h1 className="text-2xl font-bold">Broo <span className="text-primary">Stock</span></h1>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary text-white"><Plus size={18} className="mr-2" /> Nova Movimentação</Button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <Card className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Qtd.</th>
                <th className="p-4">Motivo</th>
                <th className="p-4">Canal</th>
                <th className="p-4">Pagamento</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-4">{products.find(p => p.id === m.product_id)?.name}</td>
                  <td className="p-4 capitalize">{m.type}</td>
                  <td className="p-4">{m.quantity}</td>
                  <td className="p-4 capitalize">{m.reason}</td>
                  <td className="p-4 capitalize">{m.sale_channel?.replace('_', ' ')}</td>
                  <td className="p-4 capitalize">{m.payment_method}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleOpenModal(m)} className="p-1 text-primary"><Pen size={16} /></button>
                    <button onClick={() => deleteMovement(m.id)} className="p-1 text-destructive"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-card p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar' : 'Nova'} Movimentação</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Produto</label>
                <select value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} className="w-full p-2 border rounded bg-background" required>
                  <option value="">Selecione...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full p-2 border rounded bg-background">
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Quantidade</label>
                  <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} required />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Motivo</label>
                <select value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value as any})} className="w-full p-2 border rounded bg-background">
                  <option value="compra">Compra</option>
                  <option value="venda">Venda</option>
                  <option value="devolucao">Devolução</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Canal de Venda</label>
                <select value={formData.sale_channel} onChange={e => setFormData({...formData, sale_channel: e.target.value as any})} className="w-full p-2 border rounded bg-background">
                  <option value="venda_local">Venda Local</option>
                  <option value="representante">Representante</option>
                  <option value="distribuidor">Distribuidor</option>
                </select>
              </div>

              {formData.type === 'saida' && (
                <div>
                  <label className="block text-sm mb-1">Preço de Venda</label>
                  <Input type="number" step="0.01" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value)})} />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Forma de Pagamento</label>
                <div className="space-y-1">
                  {['credito', 'debito', 'pix', 'boleto'].map(m => (
                    <label key={m} className="flex items-center gap-2 text-sm capitalize">
                      <input type="radio" name="pay" checked={formData.payment_method === m} onChange={() => setFormData({...formData, payment_method: m as any})} /> {m}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Notas</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded bg-background" rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-white">Salvar</Button>
            </form>
          </Card>
        </div>
      )}
      <Footer />
    </div>
  )
}
