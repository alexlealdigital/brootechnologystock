import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MessageCircle, Mail, Search, ArrowLeft } from 'lucide-react'
import { useLocation } from 'wouter'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  site_title?: string
  site_description?: string
  image_url?: string
  sale_price?: number
  unit_price: number
  sku: string
  category?: string
}

export default function StoreCatalog() {
  const [, navigate] = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  // Carregar produtos publicados
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_published', true)
          .eq('is_visible_on_site', true)
          .order('site_order', { ascending: true })

        if (error) throw error

        setProducts(data || [])

        // Extrair categorias únicas
        const uniqueCategories = Array.from(
          new Set((data || []).map(p => p.category).filter(Boolean))
        ) as string[]
        setCategories(uniqueCategories)
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
        toast.error('Erro ao carregar produtos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtrar produtos
  useEffect(() => {
    let filtered = products

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.site_description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm])

  const handleWhatsApp = (product: Product) => {
    const message = `Olá! Tenho interesse no produto: ${product.name} (SKU: ${product.sku})`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmail = (product: Product) => {
    setSelectedProduct(product)
    setShowContactModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-light">Nossa Loja</h1>
          </div>

          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Filtros */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Categorias</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full text-left px-3 py-2 rounded transition ${
                    selectedCategory === 'all'
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Todos os Produtos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-3 py-2 rounded transition ${
                      selectedCategory === cat
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                  >
                    {/* Imagem */}
                    <div className="aspect-square bg-gray-200 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">Sem imagem</span>
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {product.site_title || product.name}
                      </h3>

                      {product.site_description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.site_description}
                        </p>
                      )}

                      <div className="mb-4">
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        {product.category && (
                          <p className="text-xs text-gray-500">
                            Categoria: {product.category}
                          </p>
                        )}
                      </div>

                      {/* Preço */}
                      <div className="mb-4 pb-4 border-b">
                        {product.sale_price ? (
                          <div>
                            <p className="text-2xl font-bold text-black">
                              R$ {product.sale_price.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              R$ {product.unit_price.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-black">
                            R$ {product.unit_price.toFixed(2).replace('.', ',')}
                          </p>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleWhatsApp(product)}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleEmail(product)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Contato */}
      {showContactModal && selectedProduct && (
        <ContactModal
          product={selectedProduct}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  )
}

// Componente Modal de Contato
function ContactModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: `Interesse no produto: ${product.name}`,
    message: `Olá, tenho interesse no produto ${product.name} (SKU: ${product.sku}). Gostaria de mais informações.`,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      // Obter user_id do usuário autenticado (ou usar um valor padrão para contatos públicos)
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id || '00000000-0000-0000-0000-000000000000'

      const { error } = await supabase.from('contacts').insert([
        {
          user_id: userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          product_id: product.id,
        },
      ])

      if (error) throw error

      toast.success('Mensagem enviada com sucesso!')
      onClose()
    } catch (err) {
      console.error('Erro ao enviar contato:', err)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-semibold mb-4">Solicitar Informações</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensagem</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sua mensagem..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
