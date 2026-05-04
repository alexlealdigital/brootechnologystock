import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Mail, MessageSquare, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  product_id?: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  products?: { name: string }
}

export default function ContactsPanel() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all')

  // Carregar contatos
  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('contacts')
        .select('*, products(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Erro ao carregar contatos:', err)
      toast.error('Erro ao carregar contatos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'read' })
        .eq('id', contactId)

      if (error) throw error
      await fetchContacts()
      toast.success('Contato marcado como lido')
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao atualizar contato')
    }
  }

  const handleMarkAsReplied = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'replied' })
        .eq('id', contactId)

      if (error) throw error
      await fetchContacts()
      toast.success('Contato marcado como respondido')
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao atualizar contato')
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Tem certeza que deseja deletar este contato?')) return

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error
      await fetchContacts()
      setSelectedContact(null)
      toast.success('Contato deletado')
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao deletar contato')
    }
  }

  const handleSendEmail = (contact: Contact) => {
    const subject = `Re: ${contact.subject}`
    const body = `Olá ${contact.name},\n\n[Sua resposta aqui]\n\nAtenciosamente`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleSendWhatsApp = (contact: Contact) => {
    const message = `Olá ${contact.name}! Recebemos sua mensagem sobre: ${contact.subject}. Entraremos em contato em breve.`
    const whatsappUrl = `https://wa.me/${contact.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const filteredContacts = contacts.filter(c => filter === 'all' || c.status === filter)

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Contatos da Loja</h2>
        <p className="text-gray-600">Gerencie as mensagens dos clientes interessados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Novos</p>
          <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">Lidos</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.read}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Respondidos</p>
          <p className="text-3xl font-bold text-green-600">{stats.replied}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['all', 'new', 'read', 'replied', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === f
                ? 'bg-black text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de Contatos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Lista */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum contato encontrado</p>
              </div>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          contact.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : contact.status === 'read'
                            ? 'bg-yellow-100 text-yellow-700'
                            : contact.status === 'replied'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {contact.subject}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(contact.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna de Detalhes */}
        {selectedContact && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              {/* Header */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-600">{selectedContact.email}</p>
                    {selectedContact.phone && (
                      <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                    )}
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded ${
                      selectedContact.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedContact.status === 'read'
                        ? 'bg-yellow-100 text-yellow-700'
                        : selectedContact.status === 'replied'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedContact.status}
                  </span>
                </div>

                {selectedContact.products && (
                  <p className="text-sm text-gray-600">
                    <strong>Produto:</strong> {selectedContact.products.name}
                  </p>
                )}
              </div>

              {/* Assunto */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-2">Assunto</p>
                <p className="text-lg">{selectedContact.subject}</p>
              </div>

              {/* Mensagem */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-2">Mensagem</p>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedContact.message}
                </div>
              </div>

              {/* Data */}
              <div className="mb-6 pb-6 border-b text-xs text-gray-500">
                Recebido em{' '}
                {new Date(selectedContact.created_at).toLocaleString('pt-BR')}
              </div>

              {/* Ações */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendEmail(selectedContact)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                  >
                    <Mail className="w-4 h-4" />
                    Responder por Email
                  </button>
                  {selectedContact.phone && (
                    <button
                      onClick={() => handleSendWhatsApp(selectedContact)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedContact.status !== 'read' && (
                    <button
                      onClick={() => handleMarkAsRead(selectedContact.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded transition"
                    >
                      <Eye className="w-4 h-4" />
                      Marcar como Lido
                    </button>
                  )}

                  {selectedContact.status !== 'replied' && (
                    <button
                      onClick={() => handleMarkAsReplied(selectedContact.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Marcar como Respondido
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
