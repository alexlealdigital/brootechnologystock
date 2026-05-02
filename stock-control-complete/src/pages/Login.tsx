import { useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [, navigate] = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isSignUpConfirmation, setIsSignUpConfirmation] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
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
        
        setSignUpEmail(formData.email)
        setIsSignUpConfirmation(true)
        setFormData({ email: '', password: '', confirmPassword: '', fullName: '' })
      }
    } catch (error: any) {
      console.error('Auth Error Details:', error)
      
      // Extrai a mensagem de erro de várias formas possíveis
      const errorMessage = error.error_description || error.message || '';
      const status = error.status || (error.status === 0 ? 0 : null);

      if (status === 429) {
        toast.error('Muitas tentativas. Por favor, aguarde um momento.')
      } else if (
        errorMessage.includes('Invalid login credentials') || 
        errorMessage.includes('invalid_credentials') ||
        status === 400
      ) {
        if (isLogin) {
          toast.error('E-mail ou senha incorretos')
        } else {
          toast.error('Erro ao processar cadastro. Verifique os dados.')
        }
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error('Por favor, confirme seu e-mail antes de entrar')
      } else {
        toast.error(errorMessage || 'Ocorreu um erro inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  if (isSignUpConfirmation) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-green-500/20 p-4 rounded-2xl mb-4 animate-pulse">
              <CheckCircle2 className="text-green-500 h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-center" style={{ fontFamily: 'Poppins' }}>
              Verifique seu <span className="text-primary">E-mail</span>
            </h1>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Confirmação de Cadastro</CardTitle>
              <CardDescription className="text-center">
                Enviamos um link de confirmação para:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-background/50 border border-border/50 rounded-lg p-4 text-center">
                <p className="font-semibold text-foreground break-all">{signUpEmail}</p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">1.</span>
                  <span>Verifique sua caixa de entrada e procure pelo e-mail de confirmação</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">2.</span>
                  <span>Clique no link de confirmação para ativar sua conta</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">3.</span>
                  <span>Após confirmar, você poderá fazer login normalmente</span>
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Dica:</strong> Se não receber o e-mail em alguns minutos, verifique sua pasta de spam.
                </p>
              </div>

              <Button
                onClick={() => {
                  setIsSignUpConfirmation(false)
                  setIsLogin(true)
                  setFormData({ email: '', password: '', confirmPassword: '', fullName: '' })
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-semibold"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Voltar para o Login
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Broo Technology — Todos os Direitos Reservados 2026
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
