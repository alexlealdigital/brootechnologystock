import { ReactNode, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, Package, TrendingUp, BarChart3, LogOut, Menu, X } from 'lucide-react'

const NAV = [
  { label: 'Painel', icon: LayoutDashboard, path: '/' },
  { label: 'Produtos', icon: Package, path: '/products' },
  { label: 'Movimentações', icon: TrendingUp, path: '/movements' },
  { label: 'Relatórios', icon: BarChart3, path: '/reports' },
]

interface AppShellProps {
  title: string
  actions?: ReactNode
  children: ReactNode
}

export function AppShell({ title, actions, children }: AppShellProps) {
  const [location, navigate] = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }
  const go = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center border-b border-border/60">
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Poppins' }}>
          Broo <span className="text-primary">Stock</span>
          <span className="text-[10px] align-middle bg-primary/15 text-primary px-1.5 py-0.5 rounded ml-2">
            PRO
          </span>
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = location === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`w-full flex items-center gap-2.5 pl-2 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <span className={`w-1 h-5 rounded-full ${active ? 'bg-primary' : 'bg-transparent'}`} />
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border/60">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Sidebar — drawer mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border/60 h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Área de conteúdo */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 h-16 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-2 -ml-2 text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold truncate" style={{ fontFamily: 'Poppins' }}>
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
