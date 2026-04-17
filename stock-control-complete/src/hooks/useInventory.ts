import { useState, useEffect, useCallback } from 'react'
import { supabase, Product, Movement, PaymentSetting } from '@/lib/supabase'

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const [p, m, s] = await Promise.all([
      supabase.from('products').select('*').eq('user_id', user.id).order('name'),
      supabase.from('movements').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('payment_settings').select('*').eq('user_id', user.id)
    ])
    
    setProducts(p.data || [])
    setMovements(m.data || [])
    setPaymentSettings(s.data || [])
    setIsLoaded(true)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const addProduct = async (product: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('products').insert([{ ...product, user_id: user.id }])
    await fetchData()
  }

  const updateProduct = async (id: string, updates: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("products").update(updates).eq("id", id).eq("user_id", user.id)
    await fetchData()
  }

  const deleteProduct = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)
    await fetchData()
  }

  const addMovement = async (movement: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    let fee_amount = 0
    if (movement.type === 'saida' && movement.payment_method) {
      const setting = paymentSettings.find(s => s.method_name === movement.payment_method)
      fee_amount = ((movement.sale_price || 0) * movement.quantity * (setting?.fee_percentage || 0)) / 100
    }
    await supabase.from('movements').insert([{ ...movement, fee_amount, user_id: user?.id }])
    await fetchData()
  }

  const updatePaymentSettings = async (settings: any[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    for (const s of settings) {
      await supabase.from('payment_settings').upsert({ user_id: user?.id, ...s }, { onConflict: 'user_id,method_name' })
    }
    await fetchData()
  }

  const getStats = useCallback(async () => {
    const totalRevenue = movements.filter(m => m.type === 'saida' && m.reason === 'venda').reduce((sum, m) => sum + (m.quantity * (m.sale_price || 0)), 0)
    const totalFees = movements.filter(m => m.type === 'saida' && m.reason === 'venda').reduce((sum, m) => sum + (m.fee_amount || 0), 0)
    const totalProfit = movements.filter(m => m.type === 'saida' && m.reason === 'venda').reduce((sum, m) => {
      const product = products.find(p => p.id === m.product_id)
      const cost = (product?.cost_price || 0) * m.quantity
      return sum + ((m.sale_price || 0) * m.quantity - cost - (m.fee_amount || 0))
    }, 0)

    return {
      totalProducts: products.length,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      lowStock: products.filter(p => p.quantity <= p.min_quantity).length,
      inventoryValue: products.reduce((sum, p) => sum + (p.quantity * (p.cost_price || 0)), 0),
      totalRevenue, totalFees, totalProfit
    }
  }, [products, movements])

  return { products, movements, paymentSettings, isLoaded, addProduct, updateProduct, deleteProduct, addMovement, updatePaymentSettings, getStats }
}
