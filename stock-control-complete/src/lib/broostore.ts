// Integração com o backend da BrooStore (checkout + entrega de chave de licença).
//
// O backend Flask (mercadopago-final) cria a cobrança no Mercado Pago e, quando o
// pagamento PIX é aprovado, o worker reserva uma chave da tabela `chaves_licenca`
// e a envia automaticamente por e-mail para o cliente. Aqui na BrooStock só
// precisamos disparar a criação da cobrança e mostrar o QR Code.

export const BROOSTORE_API = 'https://mercadopago-final.onrender.com'

// ID do produto "Chave BrooStock" no catálogo (tabela `products` do Supabase da BrooStore).
// >>> IMPORTANTE: troque este número pelo id retornado pelo script SQL
//     (aparece no "NOTICE" do SQL Editor ao rodar o script de criação do produto).
export const BROOSTOCK_LICENSE_PRODUCT_ID = 100

// Preço apenas para exibição na tela. O valor REAL cobrado é sempre o que está
// no Supabase (definido no servidor) — o cliente nunca define o preço.
export const BROOSTOCK_LICENSE_PRICE = 99.9

export const BROOSTOCK_LICENSE_PRICE_LABEL = BROOSTOCK_LICENSE_PRICE
  .toFixed(2)
  .replace('.', ',')
