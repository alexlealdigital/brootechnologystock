import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  X, Loader2, ShieldCheck, Copy, Check, Mail, User, Phone, QrCode,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  BROOSTORE_API,
  BROOSTOCK_LICENSE_PRODUCT_ID,
  BROOSTOCK_LICENSE_PRICE_LABEL,
} from '@/lib/broostore'

interface LicenseCheckoutModalProps {
  open: boolean
  onClose: () => void
  defaultName?: string
  defaultEmail?: string
}

interface PixData {
  qr_code_base64: string
  qr_code_text: string
}

export default function LicenseCheckoutModal({
  open,
  onClose,
  defaultName = '',
  defaultEmail = '',
}: LicenseCheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [pix, setPix] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    nome: defaultName,
    email: defaultEmail,
    telefone: '',
  })

  if (!open) return null

  const resetAndClose = () => {
    setPix(null)
    setCopied(false)
    setLoading(false)
    setForm({ nome: defaultName, email: defaultEmail, telefone: '' })
    onClose()
  }

  const handleGerarPix = async () => {
    const nome = form.nome.trim()
    const email = form.email.trim()
    const telefone = form.telefone.trim()

    if (nome.length < 3) return toast.error('Informe seu nome completo')
    if (!email.includes('@') || !email.includes('.')) return toast.error('E-mail inválido')
    if (telefone.replace(/\D/g, '').length < 10) return toast.error('Telefone inválido')

    setLoading(true)
    try {
      const response = await fetch(`${BROOSTORE_API}/api/cobrancas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: BROOSTOCK_LICENSE_PRODUCT_ID,
          nome,
          email,
          telefone,
        }),
      })

      const result = await response.json()

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Não foi possível gerar o pagamento')
      }

      setPix({
        qr_code_base64: result.qr_code_base64,
        qr_code_text: result.qr_code_text,
      })
    } catch (err: any) {
      console.error('Erro ao gerar PIX:', err)
      toast.error(err?.message || 'Falha ao gerar o pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const copiarCodigo = async () => {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.qr_code_text)
      setCopied(true)
      toast.success('Código PIX copiado!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Não foi possível copiar. Copie manualmente.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                Chave do <span className="text-primary">BrooStock</span>
              </h2>
              <p className="text-xs text-muted-foreground">Pagamento seguro via PIX</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {!pix ? (
            <div className="space-y-4">
              <div className="bg-background/50 border border-border/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Licença BrooStock</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {BROOSTOCK_LICENSE_PRICE_LABEL}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <User size={14} /> Nome Completo
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Mail size={14} /> E-mail (receberá a chave aqui)
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Phone size={14} /> Telefone
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>

              <Button
                onClick={handleGerarPix}
                disabled={loading}
                className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <QrCode className="h-4 w-4" /> Gerar QR Code PIX
                  </>
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                Após o pagamento, sua chave de acesso será enviada automaticamente
                para o e-mail informado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Escaneie o QR Code no app do seu banco ou copie o código abaixo.
              </p>

              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl">
                  <img
                    src={`data:image/png;base64,${pix.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-52 h-52"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/80">
                  PIX Copia e Cola
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={pix.qr_code_text}
                    className="text-xs font-mono"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copiarCodigo}
                    className="shrink-0"
                    aria-label="Copiar código PIX"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Assim que o pagamento for confirmado, a chave de acesso chega no
                  seu e-mail. Pode levar alguns instantes.
                </p>
              </div>

              <Button
                onClick={resetAndClose}
                variant="outline"
                className="w-full"
              >
                Concluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
