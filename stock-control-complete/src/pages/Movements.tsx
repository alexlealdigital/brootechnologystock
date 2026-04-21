import { useState } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, X, ArrowLeft, Pen, Trash2, ShieldCheck, Users, ShoppingBag, Image as ImageIcon } from 'lucide-react'
import { Footer } from '@/components/ui/Footer'

export default function Movements() {
  const [, navigate] = useLocation()
  const { products, movements, entities, channels, addMovement, updateMovement, deleteMovement, isLoaded } = useInventoryContext()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    product_id: '', type: 'entrada' as 'entrada' | 'saida', quantity: 0,
    reason: 'compra' as 'compra' | 'venda' | 'devolucao', sale_channel: 'venda_local' as any,
    payment_method: 'credito' as any, notes: '', sale_price: 0,
    entity_id: '', channel_id: ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleOpenModal = (movement?: any) => {
    setError(null)
    if (movement) {
      setEditingId(movement.id)
      setFormData({
        product_id: movement.product_id, type: movement.type, quantity: movement.quantity,
        reason: movement.reason || 'compra', sale_channel: movement.sale_channel || 'venda_local',
        payment_method: movement.payment_method || 'credito', notes: movement.notes || '',
        sale_price: movement.sale_price || 0, entity_id: movement.entity_id || '', channel_id: movement.channel_id || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        product_id: '', type: 'entrada', quantity: 0, reason: 'compra',
        sale_channel: 'venda_local', payment_method: 'credito', notes: '',
        sale_price: 0, entity_id: '', channel_id: ''
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      if (!formData.product_id) return setError('Selecione um produto')
      if (formData.quantity <= 0) return setError('Quantidade inválida')

      const isVenda = formData.type === 'saida' && formData.reason === 'venda'
      const movementData = {
        ...formData,
        sale_price: isVenda && formData.sale_price === 0 
          ? (products.find(p => p.id === formData.product_id)?.unit_price || 0)
          : formData.sale_price,
      }

      if (editingId) await updateMovement(editingId, movementData)
      else await addMovement(movementData)
      
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
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
                <th className="p-4">Data</th>
                <th className="p-4">Produto</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Qtd.</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Canal/Entidade</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const product = products.find(p => p.id === m.product_id);
                return (
                  <tr key={m.id} className="border-b hover:bg-secondary/30">
                    <td className="p-4 text-xs">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                          {product?.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" size={16} />}
                        </div>
                        <span className="font-medium">{product?.name || 'Produto Removido'}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.type}</span></td>
                    <td className="p-4">{m.quantity}</td>
                    <td className="p-4">R$ {(m.sale_price || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="text-xs space-y-0.5">
                        {m.channel_id && <div className="flex items-center gap-1"><ShoppingBag size={10}/> {channels.find(c => c.id === m.channel_id)?.name}</div>}
                        {m.entity_id && <div className="flex items-center gap-1 text-muted-foreground"><Users size={10}/> {entities.find(e => e.id === m.entity_id)?.name}</div>}
                      </div>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleOpenModal(m)} className="p-1 text-primary hover:bg-primary/10 rounded"><Pen size={16} /></button>
                      <button onClick={() => deleteMovement(m.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <Card className="w-full max-w-lg bg-card p-6 relative my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar' : 'Nova'} Movimentação</h3>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Produto *</label>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                    {products.find(p => p.id === formData.product_id)?.image_url ? <img src={products.find(p => p.id === formData.product_id)?.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" size={20} />}
                  </div>
                  <select value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} className="flex-grow p-2 border border-input rounded bg-background" required>
                    <option value="">Selecione...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full p-2 border border-input rounded bg-background">
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade</label>
                  <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Motivo</label>
                  <select value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value as any})} className="w-full p-2 border border-input rounded bg-background">
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                    <option value="devolucao">Devolução</option>
                  </select>
                </div>
                {formData.type === 'saida' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Venda</label>
                    <Input type="number" step="0.01" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value) || 0})} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1"><ShoppingBag size={14}/> Canal</label>
                  <select value={formData.channel_id} onChange={e => setFormData({...formData, channel_id: e.target.value})} className="w-full p-2 border border-input rounded bg-background">
                    <option value="">Nenhum</option>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Users size={14}/> Entidade</label>
                  <select value={formData.entity_id} onChange={e => setFormData({...formData, entity_id: e.target.value})} className="w-full p-2 border border-input rounded bg-background">
                    <option value="">Nenhuma</option>
                    {entities.map(ent => <option key={ent.id} value={ent.id}>{ent.name} ({ent.type})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <div className="flex flex-wrap gap-4">
                  {['credito', 'debito', 'pix', 'boleto'].map(m => (
                    <label key={m} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                      <input type="radio" name="pay" checked={formData.payment_method === m} onChange={() => setFormData({...formData, payment_method: m as any})} /> {m}
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-white py-4 font-bold">Salvar Movimentação</Button>
            </form>
          </Card>
        </div>
      )}
      <Footer />
    </div>
  )
}
