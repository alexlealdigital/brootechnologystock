import { Button } from '@/components/ui/Button'
import { ShieldAlert, ArrowRight, RefreshCw, LogOut, Check, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  buildCheckoutUrl,
  BROOSTOCK_PLANO_MENSAL_ID,
  BROOSTOCK_PLANO_ANUAL_ID,
  PLANO_MENSAL_PRECO_LABEL,
  PLANO_ANUAL_TOTAL_LABEL,
  PLANO_ANUAL_MENSAL_LABEL,
} from '@/lib/broostore'

interface LicenseRequiredProps {
  email: string
  expiraEm?: string | null
  plano?: string | null
  onRecheck: () => void
}

export default function LicenseRequired({ email, expiraEm, plano, onRecheck }: LicenseRequiredProps) {
  const expirou = !!expiraEm
  const dataExpiracao = expiraEm
    ? new Date(expiraEm).toLocaleDateString('pt-BR')
    : null

  const irParaCheckout = (productId: number) => {
    window.location.href = buildCheckoutUrl(productId, { email })
  }

  const sair = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-amber-500/15 p-3 rounded-2xl mb-3">
            <ShieldAlert className="h-7 w-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {expirou ? 'Sua licença expirou' : 'Licença necessária'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {expirou
              ? `Seu plano ${plano || ''} venceu em ${dataExpiracao}. Renove para voltar a usar o BrooStock.`
              : 'Para usar o BrooStock, é preciso uma assinatura ativa.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Conta: {email}</p>
        </div>

        <div className="space-y-3">
          {/* Mensal */}
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-foreground">Mensal</h3>
              <span className="text-sm text-muted-foreground">renova a cada 30 dias</span>
            </div>
            <p className="mt-1">
              <span className="text-2xl font-bold text-foreground">R$ {PLANO_MENSAL_PRECO_LABEL}</span>
              <span className="text-sm text-muted-foreground"> /mês</span>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => irParaCheckout(BROOSTOCK_PLANO_MENSAL_ID)}
              className="w-full mt-3 h-11 font-semibold"
            >
              Assinar mensal <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Anual */}
          <div className="rounded-xl border border-primary/40 bg-primary/5 backdrop-blur-xl p-4 relative overflow-hidden">
            <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wide bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> Melhor valor
            </span>
            <h3 className="font-semibold text-foreground">Anual</h3>
            <p className="mt-1">
              <span className="text-2xl font-bold text-primary">R$ {PLANO_ANUAL_MENSAL_LABEL}</span>
              <span className="text-sm text-muted-foreground"> /mês</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cobrança única de R$ {PLANO_ANUAL_TOTAL_LABEL} (12 meses).
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary" /> Parcele em até 12x no cartão
              </li>
            </ul>
            <Button
              type="button"
              onClick={() => irParaCheckout(BROOSTOCK_PLANO_ANUAL_ID)}
              className="w-full mt-3 h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Assinar anual <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <button
            onClick={onRecheck}
            className="text-sm text-primary hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Já paguei, atualizar
          </button>
          <button
            onClick={sair}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>

        <p className="text-[11px] text-center text-muted-foreground mt-4">
          Use o mesmo e-mail desta conta no pagamento. A liberação é automática após a confirmação.
        </p>
      </div>
    </div>
  )
}
