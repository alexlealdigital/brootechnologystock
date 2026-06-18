import { useEffect, useState, useCallback } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { InventoryProvider } from '@/contexts/InventoryContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from 'sonner'
import { fetchLicenseStatus } from '@/lib/broostore'

import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import Movements from '@/pages/Movements'
import Reports from '@/pages/Reports'
import StoreCatalog from '@/pages/StoreCatalog'
import LicenseRequired from '@/pages/LicenseRequired'

// Rotas públicas — acessíveis sem autenticação e sem checagem de licença
const PUBLIC_ROUTES = ['/login', '/reset-password', '/loja']

type LicenseState = 'idle' | 'checking' | 'active' | 'inactive' | 'error'

function Router() {
  const [location, navigate] = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [license, setLicense] = useState<LicenseState>('idle')
  const [licenseInfo, setLicenseInfo] = useState<{ expira_em: string | null; plano: string | null }>({
    expira_em: null,
    plano: null,
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const hasUser = !!session?.user
      setIsAuthenticated(hasUser)
      setUserEmail(session?.user?.email ?? null)

      const isPublicRoute = PUBLIC_ROUTES.includes(location)

      if (!hasUser && !isPublicRoute) {
        navigate('/login')
      } else if (hasUser && location === '/login') {
        navigate('/')
      }
    }

    checkAuth()

    // Ouvir mudanças de estado (Login/Logout/Recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const hasUser = !!session?.user
      setIsAuthenticated(hasUser)
      setUserEmail(session?.user?.email ?? null)

      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password')
        return
      }

      if (event === 'SIGNED_IN') {
        setLicense('idle') // força nova checagem de licença
        if (location === '/login') navigate('/')
      } else if (event === 'SIGNED_OUT') {
        setLicense('idle')
        navigate('/login')
      } else if (!hasUser && !PUBLIC_ROUTES.includes(location)) {
        navigate('/login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [location, navigate])

  // ===== Checagem de licença =====
  const verificarLicenca = useCallback(async () => {
    if (!userEmail) return
    setLicense('checking')
    try {
      const s = await fetchLicenseStatus(userEmail)
      setLicenseInfo({ expira_em: s.expira_em, plano: s.plano })
      setLicense(s.ativa ? 'active' : 'inactive')
    } catch {
      setLicense('error')
    }
  }, [userEmail])

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(location)
    if (isAuthenticated && !isPublic && userEmail && license === 'idle') {
      verificarLicenca()
    }
  }, [isAuthenticated, userEmail, location, license, verificarLicenca])

  // Tela de transição enquanto verifica a sessão inicial
  if (isAuthenticated === null && !PUBLIC_ROUTES.includes(location)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // ===== Gate de licença (apenas em rotas protegidas com usuário logado) =====
  const isPublic = PUBLIC_ROUTES.includes(location)
  if (isAuthenticated && !isPublic) {
    if (license === 'idle' || license === 'checking') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Verificando licença...</p>
          </div>
        </div>
      )
    }

    if (license === 'error') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <p className="text-foreground font-medium">Não foi possível verificar sua licença.</p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente.
            </p>
            <button
              onClick={verificarLicenca}
              className="mt-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sair
            </button>
          </div>
        </div>
      )
    }

    if (license === 'inactive') {
      return (
        <LicenseRequired
          email={userEmail || ''}
          expiraEm={licenseInfo.expira_em}
          plano={licenseInfo.plano}
          onRecheck={verificarLicenca}
        />
      )
    }
    // license === 'active' → segue para as rotas normalmente
  }

  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/loja" component={StoreCatalog} />

      {/* Rotas protegidas */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/movements" component={Movements} />
          <Route path="/reports" component={Reports} />
        </>
      ) : (
        <Route
          path="*"
          component={() => {
            useEffect(() => {
              if (!PUBLIC_ROUTES.includes(location)) {
                navigate('/login')
              }
            }, [location, navigate])
            return null
          }}
        />
      )}

      {/* Rota 404 para rotas não encontradas e não públicas */}
      <Route path="*" component={() => <div className="p-6">Página não encontrada</div>} />
    </Switch>
  )
}

function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <Router />
        {/* O Toaster deve ficar aqui, fora do Router, para funcionar em todas as telas */}
        <Toaster position="top-right" richColors closeButton />
      </InventoryProvider>
    </ThemeProvider>
  )
}

export default App
