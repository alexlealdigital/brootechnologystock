import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PublishButtonProps {
  product: any
  onSuccess?: () => void
}

export default function PublishButton({ product, onSuccess }: PublishButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    site_title: product.site_title || product.name,
    site_description: product.site_description || '',
    sale_price: product.sale_price || product.unit_price,
    site_order: product.site_order || 0,
  })

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handlePublish = async () => {
    try {
      setIsLoading(true)

      const slug = generateSlug(formData.site_title)

      const { error } = await supabase
        .from('products')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          site_title: formData.site_title,
          site_description: formData.site_description,
          site_slug: slug,
          sale_price: formData.sale_price,
          site_order: formData.site_order,
          is_visible_on_site: true,
        })
        .eq('id', product.id)

      if (error) throw error

      toast.success('✅ Produto publicado na loja com sucesso!')
      setIsOpen(false)
      onSuccess?.()
    } catch (err) {
      console.error('Erro ao publicar:', err)
      toast.error('❌ Erro ao publicar produto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnpublish = async () => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('products')
        .update({
          is_published: false,
          is_visible_on_site: false,
        })
        .eq('id', product.id)

      if (error) throw error

      toast.success('✅ Produto removido da loja')
      setIsOpen(false)
      onSuccess?.()
    } catch (err) {
      console.error('Erro ao despublicar:', err)
      toast.error('❌ Erro ao remover produto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 ${
          product.is_published
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-400 hover:bg-gray-500'
        } text-white`}
      >
        <Upload className="w-4 h-4" />
        {product.is_published ? 'Publicado' : 'Publicar'}
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {product.is_published ? 'Gerenciar Publicação' : 'Publicar na Loja'}
            </h2>

            {!product.is_published ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título na Loja
                  </label>
                  <input
                    type="text"
                    value={formData.site_title}
                    onChange={e =>
                      setFormData({ ...formData, site_title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.site_description}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        site_description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        sale_price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ordem na Loja
                  </label>
                  <input
                    type="number"
                    value={formData.site_order}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        site_order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Produtos com menor número aparecem primeiro
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Publicar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Este produto está publicado na loja
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Publicado em:{' '}
                    {new Date(product.published_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Título:</strong> {product.site_title}
                  </p>
                  <p>
                    <strong>Preço:</strong> R${' '}
                    {product.sale_price?.toFixed(2).replace('.', ',')}
                  </p>
                  <p>
                    <strong>URL:</strong>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      /loja/{product.site_slug}
                    </code>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={handleUnpublish}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
