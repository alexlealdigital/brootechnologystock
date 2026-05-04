import { useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { InventoryProvider } from '@/contexts/InventoryContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from 'sonner'

import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import Movements from '@/pages/Movements'
import Reports from '@/pages/Reports'
import StoreCatalog from '@/pages/StoreCatalog'

// Rotas públicas — acessíveis sem autenticação
const PUBLIC_ROUTES = ['/login', '/reset-password', '/loja']

function Router() {
  const [location, navigate] = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const hasUser = !!session?.user
      setIsAuthenticated(hasUser)

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

      if (event === 'PASSWORD_RECOVERY') {
        // Supabase processou o link de recuperação — mantém na tela de reset
        navigate('/reset-password')
        return
      }

      if (event === 'SIGNED_IN') {
        if (location === '/login') navigate('/')
      } else if (event === 'SIGNED_OUT') {
        navigate('/login')
      } else if (!hasUser && !PUBLIC_ROUTES.includes(location)) {
        navigate('/login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [location, navigate])

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
            // Redireciona para o login se não estiver autenticado e a rota não for pública
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
