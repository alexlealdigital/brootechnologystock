import { useState, useEffect, useCallback } from 'react'
import { supabase, Product, Movement, PaymentSetting } from '@/lib/supabase'

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const [p, m, s, e, c] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).order('name'),
        supabase.from('movements').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('payment_settings').select('*').eq('user_id', user.id),
        supabase.from('entities').select('*').eq('user_id', user.id),
        supabase.from('channels').select('*').eq('user_id', user.id)
      ])
      
      setProducts(p.data || [])
      setMovements(m.data || [])
      setPaymentSettings(s.data || [])
      setEntities(e.data || [])
      setChannels(c.data || [])
      setIsLoaded(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // --- CRUD FUNCTIONS (EXISTING & UPDATED) ---

  const addProduct = async (product: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('products').insert([{ ...product, user_id: user.id }])
    if (err) throw err
    await fetchData()
  }

  const updateProduct = async (id: string, updates: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from("products").update(updates).eq("id", id).eq("user_id", user.id)
    if (err) throw err
    await fetchData()
  }

  const deleteProduct = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)
    if (err) throw err
    await fetchData()
  }

  const addMovement = async (movement: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    let fee_amount = 0
    if (movement.type === 'saida' && movement.payment_method) {
      const setting = paymentSettings.find(s => s.method_name === movement.payment_method)
      fee_amount = ((movement.sale_price || 0) * movement.quantity * (setting?.fee_percentage || 0)) / 100
    }
    
    const { error: err } = await supabase.from('movements').insert([{ 
      ...movement, 
      fee_amount, 
      user_id: user.id,
      date: movement.date || new Date().toISOString()
    }])
    if (err) throw err
    await fetchData()
  }

  const updateMovement = async (id: string, updates: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    let fee_amount = updates.fee_amount
    if (updates.type === 'saida' && updates.payment_method) {
      const setting = paymentSettings.find(s => s.method_name === updates.payment_method)
      fee_amount = ((updates.sale_price || 0) * updates.quantity * (setting?.fee_percentage || 0)) / 100
    } else if (updates.type === 'entrada') {
      fee_amount = 0
    }
    
    const { error: err } = await supabase
      .from('movements')
      .update({ ...updates, fee_amount })
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (err) throw err
    await fetchData()
  }

  const deleteMovement = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from("movements").delete().eq("id", id).eq("user_id", user.id)
    if (err) throw err
    await fetchData()
  }

  const updatePaymentSettings = async (settings: any[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    for (const s of settings) {
      const { error: err } = await supabase.from('payment_settings').upsert(
        { user_id: user.id, ...s }, 
        { onConflict: 'user_id,method_name' }
      )
      if (err) throw err
    }
    await fetchData()
  }

  // --- NEW ENTITY & CHANNEL FUNCTIONS ---

  const addEntity = async (entity: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('entities').insert([{ ...entity, user_id: user.id }])
    if (err) throw err
    await fetchData()
  }

  const addChannel = async (channel: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('channels').insert([{ ...channel, user_id: user.id }])
    if (err) throw err
    await fetchData()
  }

  // --- ADVANCED METRICS ---

  const getStats = useCallback(async () => {
    const salesMovements = movements.filter(m => m.type === 'saida' && m.reason === 'venda')
    
    // 1. Financeiro Resumido
    const totalRevenue = salesMovements.reduce((sum, m) => sum + (m.quantity * (m.sale_price || 0)), 0)
    const totalFees = salesMovements.reduce((sum, m) => sum + (m.fee_amount || 0), 0)
    const totalProfit = salesMovements.reduce((sum, m) => {
      const product = products.find(p => p.id === m.product_id)
      const cost = (product?.cost_price || 0) * m.quantity
      return sum + ((m.sale_price || 0) * m.quantity - cost - (m.fee_amount || 0))
    }, 0)

    // 2. Novas Métricas (Onda 1)
    const inventoryValue = products.reduce((sum, p) => sum + (p.quantity * (p.cost_price || 0)), 0)
    const ticketMedio = salesMovements.length > 0 ? totalRevenue / salesMovements.length : 0
    const weightedFeeRate = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0

    // 3. Rankings
    const productSales = salesMovements.reduce((acc: any, m) => {
      const pid = m.product_id
      if (!acc[pid]) acc[pid] = { name: products.find(p => p.id === pid)?.name || 'Desconhecido', volume: 0, revenue: 0, profit: 0 }
      const product = products.find(p => p.id === pid)
      const cost = (product?.cost_price || 0) * m.quantity
      acc[pid].volume += m.quantity
      acc[pid].revenue += m.quantity * (m.sale_price || 0)
      acc[pid].profit += (m.quantity * (m.sale_price || 0)) - cost - (m.fee_amount || 0)
      return acc
    }, {})

    const topProductsByVolume = Object.values(productSales).sort((a: any, b: any) => b.volume - a.volume).slice(0, 5)
    const topProductsByProfit = Object.values(productSales).sort((a: any, b: any) => b.profit - a.profit).slice(0, 5)

    // 4. Métodos de Pagamento
    const paymentMethodsDist = salesMovements.reduce((acc: any, m) => {
      const method = m.payment_method || 'Outro'
      acc[method] = (acc[method] || 0) + (m.quantity * (m.sale_price || 0))
      return acc
    }, {})

    return {
      totalProducts: products.length,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      lowStock: products.filter(p => p.quantity <= p.min_quantity).length,
      inventoryValue,
      totalRevenue, 
      totalFees, 
      totalProfit,
      ticketMedio,
      weightedFeeRate,
      topProductsByVolume,
      topProductsByProfit,
      paymentMethodsDist
    }
  }, [products, movements])

  return { 
    products, 
    movements, 
    paymentSettings, 
    entities,
    channels,
    isLoaded, 
    isLoading,
    error,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addMovement, 
    updateMovement,
    deleteMovement,
    updatePaymentSettings,
    addEntity,
    addChannel,
    getStats 
  }
}
