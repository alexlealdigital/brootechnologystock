import { useLocation } from 'wouter'
import { Button } from '@/components/ui/Button'
import {
  Wallet, TrendingUp, BarChart3, Package, AlertTriangle, Smartphone,
  Store, Users, ArrowRight, Check, ShieldCheck, Zap, Receipt, Tag, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'
import {
  PLANO_MENSAL_PRECO_LABEL, PLANO_ANUAL_TOTAL_LABEL, PLANO_ANUAL_MENSAL_LABEL,
} from '@/lib/broostore'

export default function Landing() {
  const [, navigate] = useLocation()
  const entrar = () => navigate('/login')
  const comecar = () => navigate('/login?signup=1')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Poppins' }}>
            Broo <span className="text-primary">Stock</span>
            <span className="text-[10px] align-middle bg-primary/15 text-primary px-1.5 py-0.5 rounded ml-2">PRO</span>
          </span>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground transition-colors">Recursos</a>
            <a href="#como" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={entrar}>Entrar</Button>
            <Button size="sm" className="bg-primary text-primary-foreground" onClick={comecar}>Começar grátis</Button>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-5">
              <Zap size={13} /> Estoque + Financeiro num lugar só
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight" style={{ fontFamily: 'Poppins' }}>
              Saiba o <span className="text-green-400">lucro real</span> do seu negócio — não só o faturamento.
            </h1>
            <p className="mt-5 text-base text-muted-foreground max-w-md">
              O BrooStock controla seu estoque e calcula seu lucro líquido já descontando
              taxas de cartão, PIX e o custo dos produtos. Tudo em tempo real, no computador
              e no celular.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-6 bg-primary text-primary-foreground font-semibold" onClick={comecar}>
                Comece grátis — 7 dias <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 border-border" onClick={entrar}>
                Já tenho conta
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> Dados em tempo real</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> Funciona no celular</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> PIX e cartão</span>
            </div>
          </div>

          {/* Mini-painel (assinatura visual) */}
          <DashboardPreview />
        </div>
      </section>

      {/* ===== DIFERENCIAL ===== */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-6 text-center">
          <Highlight value="Lucro líquido" label="já com taxas e custo descontados" />
          <Highlight value="Tempo real" label="cada venda atualiza estoque e financeiro" />
          <Highlight value="No bolso" label="instale como app no celular (PWA)" />
        </div>
      </section>

      {/* ===== RECURSOS ===== */}
      <section id="recursos" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins' }}>Tudo que você precisa para vender com clareza</h2>
          <p className="mt-3 text-muted-foreground">Do cadastro do produto ao lucro do mês, sem planilha e sem achismo.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature icon={<BarChart3 className="text-green-400" />} title="Lucro de verdade"
            desc="Faturamento, lucro líquido e margem calculados automaticamente, descontando taxas de cada meio de pagamento e o custo do produto." />
          <Feature icon={<AlertTriangle className="text-red-400" />} title="Estoque sob controle"
            desc="Defina estoque mínimo e máximo e receba alerta de produtos acabando. SKU, código de barras, categorias e foto em cada item." />
          <Feature icon={<Store className="text-primary" />} title="Multicanal"
            desc="Registre vendas por canal (loja, representante, distribuidor) e acompanhe clientes e fornecedores em um só painel." />
          <Feature icon={<Receipt className="text-primary" />} title="Taxas configuráveis"
            desc="Cadastre as taxas de crédito, débito, PIX e boleto uma vez. O sistema desconta sozinho no cálculo do seu lucro." />
          <Feature icon={<TrendingUp className="text-green-400" />} title="Relatórios e ranking"
            desc="Veja os produtos mais lucrativos, o que está com estoque baixo e o que está parado sobrando no estoque." />
          <Feature icon={<Smartphone className="text-primary" />} title="No PC e no celular"
            desc="Acesse de qualquer lugar pelo navegador e instale como aplicativo no celular para usar na correria do dia a dia." />
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como" className="bg-card/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins' }}>Comece em três passos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Step n="1" icon={<Tag size={20} />} title="Cadastre seus produtos"
              desc="Nome, SKU, custo, preço, estoque mínimo e foto. Em minutos seu catálogo está pronto." />
            <Step n="2" icon={<ArrowDownLeft size={20} />} title="Registre as movimentações"
              desc="Entradas e saídas, com canal e meio de pagamento. O estoque se ajusta na hora." />
            <Step n="3" icon={<Wallet size={20} />} title="Acompanhe o resultado"
              desc="Lucro, margem e alertas de estoque atualizados em tempo real, sempre que você abrir." />
          </div>
        </div>
      </section>

      {/* ===== PLANOS ===== */}
      <section id="planos" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins' }}>Um plano simples, sem surpresa</h2>
          <p className="mt-3 text-muted-foreground">Crie sua conta e ative quando quiser. Pague por PIX ou cartão.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Mensal */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 flex flex-col">
            <h3 className="font-semibold text-lg">Mensal</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold">R$ {PLANO_MENSAL_PRECO_LABEL}</span>
              <span className="text-muted-foreground"> /mês</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Renova a cada 30 dias.</p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground flex-1">
              <li className="flex items-center gap-2"><Check size={15} className="text-primary" /> Acesso completo</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-primary" /> PIX ou cartão</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-primary" /> Uso no PC e no celular</li>
            </ul>
            <Button variant="outline" className="w-full mt-6 h-11" onClick={entrar}>Assinar mensal</Button>
          </div>

          {/* Anual */}
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 flex flex-col relative overflow-hidden">
            <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wide bg-primary/20 text-primary px-2 py-0.5 rounded-full">Melhor valor</span>
            <h3 className="font-semibold text-lg">Anual</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold text-primary">R$ {PLANO_ANUAL_MENSAL_LABEL}</span>
              <span className="text-muted-foreground"> /mês</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Cobrança única de R$ {PLANO_ANUAL_TOTAL_LABEL} (12 meses).</p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/80 flex-1">
              <li className="flex items-center gap-2"><Check size={15} className="text-primary" /> Tudo do mensal</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-primary" /> Economia frente ao mensal</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-primary" /> Parcele em até 12x no cartão</li>
            </ul>
            <Button className="w-full mt-6 h-11 bg-primary text-primary-foreground" onClick={entrar}>Assinar anual</Button>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Você cria a conta primeiro e ativa o plano com o mesmo e-mail. A liberação é automática após o pagamento.
        </p>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-4xl mx-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent p-10 text-center">
          <ShieldCheck className="mx-auto text-primary mb-4" size={32} />
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Poppins' }}>Pare de adivinhar seu lucro.</h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Crie sua conta agora e comece a enxergar estoque e resultado do seu negócio com clareza.
          </p>
          <Button size="lg" className="mt-7 h-12 px-8 bg-primary text-primary-foreground font-semibold" onClick={comecar}>
            Comece grátis — 7 dias <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Broo <span className="text-primary">Stock</span></span>
          <span>Broo Technology — Todos os Direitos Reservados 2026</span>
          <button onClick={entrar} className="hover:text-foreground transition-colors">Entrar</button>
        </div>
      </footer>
    </div>
  )
}

/* ---------- subcomponentes ---------- */

function Highlight({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6 hover:border-primary/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function Step({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/40 p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">{n}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur shadow-2xl overflow-hidden">
        {/* barra de janela */}
        <div className="flex items-center gap-1.5 px-4 h-9 border-b border-border/50 bg-background/40">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          <span className="ml-3 text-xs text-muted-foreground">Painel Financeiro</span>
        </div>
        <div className="p-4 space-y-3">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <MiniKpi label="Faturamento" value="R$ 360,00" />
            <MiniKpi label="Lucro Líquido" value="R$ 143,80" accent="text-green-400" />
            <MiniKpi label="Margem" value="39,9%" />
          </div>
          {/* alerta estoque */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-2">
              <AlertTriangle size={13} /> Estoque baixo
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/80">Camisa · Branca G</span>
              <span className="text-red-400 font-semibold">6 / mín 10</span>
            </div>
          </div>
          {/* movimentações */}
          <div className="space-y-1.5">
            <MiniMov name="Top Nadador" up qty="+12" />
            <MiniMov name="Legging Cirrê" qty="-3" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 hidden sm:flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
        <Package size={13} /> em tempo real
      </div>
    </div>
  )
}

function MiniKpi({ label, value, accent = '' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-background/50 border border-border/40 p-2.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${accent}`}>{value}</p>
    </div>
  )
}

function MiniMov({ name, qty, up = false }: { name: string; qty: string; up?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${up ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          {up ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
        </span>
        <span className="text-xs text-foreground/80 truncate">{name}</span>
      </div>
      <span className={`text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>{qty}</span>
    </div>
  )
}
