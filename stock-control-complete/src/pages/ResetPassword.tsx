import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ShieldCheck, Lock, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPassword() {
  const [, navigate] = useLocation()
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null) // null = verificando
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    // O Supabase envia o link no formato:
    // https://seuapp.com/reset-password#access_token=...&type=recovery
    //
    // O @supabase/supabase-js v2 detecta automaticamente o hash da URL
    // e dispara um evento SIGNED_IN com type 'recovery'.
    // Basta escutar onAuthStateChange aqui.

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token válido — usuário está "logado temporariamente" para trocar a senha
        setTokenValid(true)
      } else if (event === 'SIGNED_IN' && session) {
        // Caso o SDK já tenha processado antes de montarmos o listener
        setTokenValid(true)
      }
    })

    // Verificação imediata da sessão atual (caso o evento já tenha disparado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTokenValid(true)
      } else {
        // Sem sessão e sem evento após 2s = link inválido/expirado
        setTimeout(() => {
          setTokenValid((prev) => (prev === null ? false : prev))
        }, 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      toast.success('Senha atualizada com sucesso!')

      // Pequeno delay para o usuário ver o toast antes de redirecionar
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar a senha')
    } finally {
      setLoading(false)
    }
  }

  // --- Estados de carregamento / erro / formulário ---

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse">Validando link de recuperação...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <XCircle className="h-16 w-16 text-destructive" />
            <CardTitle className="text-xl text-center">Link inválido ou expirado</CardTitle>
            <CardDescription className="text-center">
              Solicite um novo link de recuperação de senha na tela de login.
            </CardDescription>
            <Button
              onClick={() => navigate('/login')}
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Ir para o Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 mb-4">
            <ShieldCheck className="text-white h-8 w-8" />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'Poppins' }}
          >
            Broo <span className="text-primary">Stock</span>
          </h1>
          <p className="text-muted-foreground mt-2">Gestão inteligente de inventário</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Criar nova senha</CardTitle>
            <CardDescription className="text-center">
              Escolha uma senha forte com pelo menos 6 caracteres
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Lock size={14} /> Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Lock size={14} /> Confirmar Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Atualizar Senha
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar e voltar ao Login
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Broo Technology — Todos os Direitos Reservados 2026
        </p>
      </div>
    </div>
  )
}
