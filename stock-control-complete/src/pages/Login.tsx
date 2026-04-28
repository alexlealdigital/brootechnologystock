import { useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [, navigate] = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          // IMPORTANTE: aponta para a rota /reset-password do app modular
          // O Supabase vai redirecionar o usuário para esta URL com o token no hash (#)
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        toast.success('Link de recuperação enviado para seu e-mail!')
        setIsForgotPassword(false)
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        // A navegação será tratada pelo onAuthStateChange no App.tsx
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem')
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.fullName }
          }
        })
        if (error) throw error
        toast.success('Conta criada! Verifique seu e-mail para confirmar.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 mb-4">
            <ShieldCheck className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Poppins' }}>
            Broo <span className="text-primary">Stock</span>
          </h1>
          <p className="text-muted-foreground mt-2">Gestão inteligente de inventário</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isForgotPassword ? 'Recuperar Senha' : isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgotPassword
                ? 'Enviaremos um link de alteração para seu e-mail'
                : isLogin
                  ? 'Entre com suas credenciais para acessar o painel'
                  : 'Preencha os dados abaixo para se cadastrar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <User size={14} /> Nome Completo
                  </label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Mail size={14} /> E-mail
                </label>
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                      <Lock size={14} /> Senha
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <Lock size={14} /> Confirmar Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isForgotPassword ? 'Enviar Link' : isLogin ? 'Entrar no Sistema' : 'Cadastrar'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setIsForgotPassword(false)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isForgotPassword
                  ? 'Voltar para o Login'
                  : isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
              </button>
              {isForgotPassword && (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-sm text-primary hover:underline"
                  >
                    Voltar para o Login
                  </button>
                </div>
              )}
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
