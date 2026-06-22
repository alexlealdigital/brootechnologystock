import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Play, Clock, PlayCircle, HelpCircle } from 'lucide-react'

type Video = {
  youtubeId: string // deixe vazio ('') enquanto o vídeo não estiver pronto
  title: string
  category: 'Primeiros passos' | 'Produtos' | 'Vendas' | 'Financeiro'
  level: 'Iniciante' | 'Intermediário'
  duration: string
  desc?: string
}

// ===== Lista de vídeos =====
// Para adicionar/editar: troque o youtubeId pelo ID do vídeo no YouTube
// (a parte depois de "watch?v="). Use vídeos "Não listados".
const VIDEOS: Video[] = [
  { youtubeId: '', title: 'Visão geral: o que é o BrooStock', category: 'Primeiros passos', level: 'Iniciante', duration: '1:00', desc: 'Um tour rápido pelo sistema em 1 minuto.' },
  { youtubeId: '', title: 'Cadastrando seu primeiro produto', category: 'Produtos', level: 'Iniciante', duration: '2:00', desc: 'SKU, custo, preço, estoque mínimo e foto.' },
  { youtubeId: '', title: 'Registrando uma venda e uma compra', category: 'Vendas', level: 'Iniciante', duration: '2:30', desc: 'Movimentações com canal e meio de pagamento.' },
  { youtubeId: '', title: 'Entendendo o Painel: faturamento, lucro e margem', category: 'Financeiro', level: 'Intermediário', duration: '2:30', desc: 'Como ler os números e usar o filtro de período.' },
  { youtubeId: '', title: 'Configurando as taxas de pagamento', category: 'Financeiro', level: 'Intermediário', duration: '1:30', desc: 'Deixe o cálculo de lucro sair certo.' },
  { youtubeId: '', title: 'Canais e Entidades', category: 'Primeiros passos', level: 'Iniciante', duration: '2:00', desc: 'Clientes, fornecedores e canais de venda.' },
  { youtubeId: '', title: 'Instalando no celular (PWA)', category: 'Primeiros passos', level: 'Iniciante', duration: '1:00', desc: 'Use o BrooStock como app no celular.' },
]

const CATEGORIES = ['Todos', 'Primeiros passos', 'Produtos', 'Vendas', 'Financeiro'] as const

export default function ComoUsar() {
  const [cat, setCat] = useState<string>('Todos')
  const list = cat === 'Todos' ? VIDEOS : VIDEOS.filter(v => v.category === cat)

  return (
    <AppShell title="Como Usar">
      <p className="text-muted-foreground mb-5 max-w-2xl">
        Vídeos curtos, passo a passo, mostrando como usar cada parte do BrooStock.
        Comece pelos "Primeiros passos" e vá no seu ritmo.
      </p>

      {/* Filtro por categoria */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${cat === c ? 'bg-primary text-primary-foreground' : 'bg-card/50 text-muted-foreground hover:text-foreground border border-border/50'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grade de vídeos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((v, i) => <VideoCard key={i} v={v} />)}
      </div>

      {/* Ajuda extra */}
      <div className="mt-8 rounded-2xl border border-border/50 bg-card/40 p-5 flex items-start gap-3">
        <HelpCircle className="text-primary shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-medium">Não encontrou o que procurava?</p>
          <p className="text-sm text-muted-foreground">Em breve mais vídeos por aqui. Enquanto isso, passe o mouse sobre os itens do menu e nos ícones (i) do painel para dicas rápidas.</p>
        </div>
      </div>
    </AppShell>
  )
}

function VideoCard({ v }: { v: Video }) {
  const [playing, setPlaying] = useState(false)
  const has = !!v.youtubeId

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
      <div className="relative aspect-video bg-secondary/30">
        {playing && has ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : has ? (
          <button onClick={() => setPlaying(true)} className="group absolute inset-0 w-full h-full" aria-label={`Assistir: ${v.title}`}>
            <img
              src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
              alt={v.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center shadow-lg">
                <Play className="text-white ml-0.5" size={24} fill="currentColor" />
              </span>
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-gradient-to-br from-primary/10 to-secondary/20">
            <PlayCircle size={30} className="opacity-60" />
            <span className="text-[11px] uppercase tracking-wider">Em breve</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm leading-snug">{v.title}</h3>
        {v.desc && <p className="text-xs text-muted-foreground mt-1 flex-1">{v.desc}</p>}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span className="truncate">{v.category} · {v.level}</span>
          <span className="flex items-center gap-1 shrink-0"><Clock size={12} /> {v.duration}</span>
        </div>
      </div>
    </div>
  )
}
