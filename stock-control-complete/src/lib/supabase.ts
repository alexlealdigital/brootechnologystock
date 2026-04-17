import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  user_id: string
  name: string
  sku: string
  category?: string
  quantity: number
  min_quantity: number
  max_quantity: number
  unit_price: number
  cost_price: number
  created_at: string
  updated_at: string
}

export type Movement = {
  id: string
  user_id: string
  product_id: string
  type: 'entrada' | 'saida'
  quantity: number
  reason: 'compra' | 'venda' | 'devolucao'
  movement_reason?: string
  sale_channel?: 'venda_local' | 'representante' | 'distribuidor'
  payment_method?: 'credito' | 'debito' | 'pix' | 'boleto'
  fee_amount?: number
  sale_price?: number
  notes?: string
  date: string
  created_at: string
}

export type PaymentSetting = {
  id: string
  user_id: string
  method_name: 'credito' | 'debito' | 'pix' | 'boleto'
  fee_percentage: number
  updated_at: string
}
