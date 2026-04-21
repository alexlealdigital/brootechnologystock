import { useState, useRef } from 'react'
import { useLocation } from 'wouter'
import { useInventoryContext } from '@/contexts/InventoryContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, X, ArrowLeft, Pen, Trash2, ShieldCheck, Tag, Image as ImageIcon, Barcode, Box, Upload, Loader2 } from 'lucide-react'
import { Footer } from '@/components/ui/Footer'

export default function Products() {
  const [, navigate] = useLocation()
  const { products, addProduct, updateProduct, deleteProduct, uploadImage, isLoaded } = useInventoryContext()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', quantity: 0, min_quantity: 0, max_quantity: 0,
    cost_price: 0, unit_price: 0, barcode: '', unit: 'un', image_url: '', tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState('')

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        quantity: product.quantity || 0,
        min_quantity: product.min_quantity || 0,
        max_quantity: product.max_quantity || 0,
        cost_price: product.cost_price || 0,
        unit_price: product.unit_price || 0,
        barcode: product.barcode || '',
        unit: product.unit || 'un',
        image_url: product.image_url || '',
        tags: product.tags || []
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '', sku: '', category: '', quantity: 0, min_quantity: 0, max_quantity: 0,
        cost_price: 0, unit_price: 0, barcode: '', unit: 'un', image_url: '', tags: []
      })
    }
    setShowModal(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const publicUrl = await uploadImage(file)
      setFormData(prev => ({ ...prev, image_url: publicUrl }))
    } catch (err) {
      alert('Erro ao carregar imagem. Verifique se o bucket "product-images" está configurado no Supabase.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) await updateProduct(editingId, formData)
    else await addProduct(formData)
    setShowModal(false)
  }

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] })
      setTagInput('')
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
          <Button onClick={() => handleOpenModal()} className="bg-primary text-white"><Plus size={18} className="mr-2" /> Novo Produto</Button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p.id} className="p-4 flex flex-col relative overflow-hidden">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-secondary rounded flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" size={24} />}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-lg truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">SKU: {p.sku}</p>
                  <div className="flex gap-1 mt-1 overflow-x-auto pb-1 no-scrollbar">
                    {p.category && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded whitespace-nowrap">{p.category}</span>}
                    {p.tags?.map((t: string) => <span key={t} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">{t}</span>)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-border/50 pt-4">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">Estoque</p>
                  <p className={`text-xl font-bold ${p.quantity <= p.min_quantity ? 'text-red-500' : 'text-primary'}`}>
                    {p.quantity} <span className="text-xs font-normal text-muted-foreground">{p.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">Preço Venda</p>
                  <p className="text-xl font-bold">R$ {p.unit_price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleOpenModal(p)} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"><Pen size={16} /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 size={16} /></button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-card p-6 relative my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 hover:bg-secondary p-1 rounded"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar' : 'Novo'} Produto</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome do Produto *</label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Camisa" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU *</label>
                      <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required placeholder="Branca G" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Bebidas" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Barcode size={14}/> Cód. Barras</label>
                      <Input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Box size={14}/> Unidade</label>
                      <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-2 border border-input rounded bg-background text-sm">
                        <option value="un">Unidade (un)</option>
                        <option value="kg">Quilo (kg)</option>
                        <option value="mt">Metro (mt)</option>
                        <option value="cx">Caixa (cx)</option>
                        <option value="pct">Pacote (pct)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><ImageIcon size={14}/> URL da Imagem</label>
                    <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Custo</label>
                      <Input type="number" step="0.01" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Venda</label>
                      <Input type="number" step="0.01" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Atual</label>
                      <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Mínimo</label>
                      <Input type="number" value={formData.min_quantity} onChange={e => setFormData({...formData, min_quantity: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Máximo</label>
                      <Input type="number" value={formData.max_quantity} onChange={e => setFormData({...formData, max_quantity: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-secondary/20">
                    {formData.image_url ? (
                      <div className="relative w-24 h-24 rounded overflow-hidden border border-border">
                        <img src={formData.image_url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-0 right-0 bg-red-500 text-white p-1"><X size={12}/></button>
                      </div>
                    ) : (
                      <ImageIcon size={32} className="text-muted-foreground" />
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload size={16} className="mr-2" />}
                      Carregar Imagem (Local)
                    </Button>
                    <p className="text-[10px] text-muted-foreground">JPG, PNG ou WEBP (Max 5MB)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Tag size={14}/> Tags</label>
                    <div className="flex gap-2">
                      <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." />
                      <Button type="button" onClick={addTag} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map(t => (
                        <span key={t} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                          {t} <button type="button" onClick={() => setFormData({...formData, tags: formData.tags.filter(x => x !== t)})}><X size={12}/></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-white py-6 text-lg font-bold">
                {editingId ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            </form>
          </Card>
        </div>
      )}
      <Footer />
    </div>
  )
}
