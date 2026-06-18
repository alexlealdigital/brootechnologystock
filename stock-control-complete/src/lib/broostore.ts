// Integração com o checkout da BrooStore (página hospedada comprar.html).
// O BrooStock apenas redireciona para a página de pagamento, que reaproveita
// o checkout completo (PIX + Cartão + Cupom) já testado na BrooStore.

export const BROOSTORE_API = 'https://mercadopago-final.onrender.com'

// IDs dos produtos de assinatura no banco da BrooStore.
// >>> Ajuste para os ids retornados pelo seed (seed_planos_broostock.py).
export const BROOSTOCK_PLANO_MENSAL_ID = 101
export const BROOSTOCK_PLANO_ANUAL_ID = 102

// Apenas para exibição. O valor REAL cobrado vem sempre do servidor.
export const PLANO_MENSAL_PRECO_LABEL = '129,90'
export const PLANO_ANUAL_TOTAL_LABEL = '1.078,80'
export const PLANO_ANUAL_MENSAL_LABEL = '89,90'

// Monta a URL da página de checkout, passando o produto e (opcional) os
// dados da conta. O e-mail vai travado no checkout para a licença ficar
// vinculada ao mesmo e-mail da conta BrooStock.
export function buildCheckoutUrl(
  productId: number,
  opts?: { email?: string; nome?: string }
): string {
  const u = new URL(`${BROOSTORE_API}/comprar.html`)
  u.searchParams.set('produto', String(productId))
  if (opts?.email) u.searchParams.set('email', opts.email)
  if (opts?.nome) u.searchParams.set('nome', opts.nome)
  u.searchParams.set('return', `${window.location.origin}/login`)
  return u.toString()
}

export interface LicenseStatus {
  ativa: boolean
  plano: string | null
  expira_em: string | null
  status?: string
}

// Consulta o status da licença pelo e-mail. Lança erro em falha de rede/servidor
// (o gate trata isso mostrando uma tela de "tentar novamente").
export async function fetchLicenseStatus(
  email: string,
  timeoutMs = 15000
): Promise<LicenseStatus> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const url = `${BROOSTORE_API}/api/licenca/status?email=${encodeURIComponent(email)}`
    const r = await fetch(url, { signal: ctrl.signal })
    if (!r.ok) throw new Error(`status ${r.status}`)
    return (await r.json()) as LicenseStatus
  } finally {
    clearTimeout(t)
  }
}
