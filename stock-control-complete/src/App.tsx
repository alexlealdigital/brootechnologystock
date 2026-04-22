import { useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { InventoryProvider } from '@/contexts/InventoryContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import Movements from '@/pages/Movements'
import Reports from '@/pages/Reports'

function Router() {
  const [location, navigate] = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const hasUser = !!session?.user
      setIsAuthenticated(hasUser)
      
      if (!hasUser && location !== '/login') {
        navigate('/login')
      } else if (hasUser && location === '/login') {
        navigate('/')
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const hasUser = !!session?.user
      setIsAuthenticated(hasUser)
      
      if (event === 'SIGNED_OUT' || !hasUser) {
        navigate('/login')
      } else if (event === 'SIGNED_IN' && location === '/login') {
        navigate('/')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [navigate, location])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/movements" component={Movements} />
          <Route path="/reports" component={Reports} />
        </>
      ) : (
        <Route path="*" component={() => {
          useEffect(() => { navigate('/login') }, [])
          return null
        }} />
      )}
      <Route path="*" component={() => <div className="p-6">Página não encontrada</div>} />
    </Switch>
  )
}

function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <Router />
      </InventoryProvider>
    </ThemeProvider>
  )
}

export default App
