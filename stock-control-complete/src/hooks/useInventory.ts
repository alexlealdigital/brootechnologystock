import { useState, useEffect, useCallback } from 'react'
import { supabase, Product, Movement, PaymentSetting } from '@/lib/supabase'

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const [p, m, s, e, c, cat] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).order('name'),
        supabase.from('movements').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('payment_settings').select('*').eq('user_id', user.id),
        supabase.from('entities').select('*').eq('user_id', user.id).order('name'),
        supabase.from('channels').select('*').eq('user_id', user.id).order('name'),
        supabase.from('categories').select('*').eq('user_id', user.id).order('name')
      ])
      
      setProducts(p.data || [])
      setMovements(m.data || [])
      setPaymentSettings(s.data || [])
      setEntities(e.data || [])
      setChannels(c.data || [])
      setCategories(cat.data || [])
      setIsLoaded(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const uploadImage = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
      return publicUrl
    } catch (err) { throw err }
  }

  // --- CRUD FUNCTIONS ---
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

  // --- NOVAS ENTIDADES (CATEGORIAS, CANAIS, ENTIDADES) ---
  const addCategory = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('categories').insert([{ name, user_id: user.id }])
    if (err) throw err
    await fetchData()
  }

  const deleteCategory = async (id: string) => {
    const { error: err } = await supabase.from('categories').delete().eq('id', id)
    if (err) throw err
    await fetchData()
  }

  const addEntity = async (entity: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('entities').insert([{ ...entity, user_id: user.id }])
    if (err) throw err
    await fetchData()
  }

  const deleteEntity = async (id: string) => {
    const { error: err } = await supabase.from('entities').delete().eq('id', id)
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

  const deleteChannel = async (id: string) => {
    const { error: err } = await supabase.from('channels').delete().eq('id', id)
    if (err) throw err
    await fetchData()
  }

  // --- MOVIMENTAÇÕES ---
  const addMovement = async (movement: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let fee_amount = 0
    if (movement.type === 'saida' && movement.payment_method) {
      const setting = paymentSettings.find(s => s.method_name === movement.payment_method)
      fee_amount = ((movement.sale_price || 0) * movement.quantity * (setting?.fee_percentage || 0)) / 100
    }
    const { error: err } = await supabase.from('movements').insert([{ ...movement, fee_amount, user_id: user.id, date: movement.date || new Date().toISOString() }])
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
    }
    const { error: err } = await supabase.from('movements').update({ ...updates, fee_amount }).eq('id', id).eq('user_id', user.id)
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
      await supabase.from('payment_settings').upsert({ user_id: user.id, ...s }, { onConflict: 'user_id,method_name' })
    }
    await fetchData()
  }

  const getStats = useCallback(async () => {
    const salesMovements = movements.filter(m => m.type === 'saida' && m.reason === 'venda')
    const totalRevenue = salesMovements.reduce((sum, m) => sum + (m.quantity * (m.sale_price || 0)), 0)
    const totalFees = salesMovements.reduce((sum, m) => sum + (m.fee_amount || 0), 0)
    const totalProfit = salesMovements.reduce((sum, m) => {
      const product = products.find(p => p.id === m.product_id)
      const cost = (product?.cost_price || 0) * m.quantity
      return sum + ((m.sale_price || 0) * m.quantity - cost - (m.fee_amount || 0))
    }, 0)
    const inventoryValue = products.reduce((sum, p) => sum + (p.quantity * (p.cost_price || 0)), 0)
    const ticketMedio = salesMovements.length > 0 ? totalRevenue / salesMovements.length : 0
    const productStats = salesMovements.reduce((acc: any, m) => {
      const pid = m.product_id
      const product = products.find(p => p.id === pid)
      if (!acc[pid]) acc[pid] = { name: product?.name || 'Desconhecido', image_url: product?.image_url, profit: 0 }
      const cost = (product?.cost_price || 0) * m.quantity
      acc[pid].profit += (m.quantity * (m.sale_price || 0)) - cost - (m.fee_amount || 0)
      return acc
    }, {})
    const topProductsByProfit = Object.values(productStats).sort((a: any, b: any) => b.profit - a.profit).slice(0, 5)
    const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity).sort((a, b) => a.quantity - b.quantity)

    return { totalProducts: products.length, totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0), lowStock: lowStockProducts.length, lowStockList: lowStockProducts, inventoryValue, totalRevenue, totalFees, totalProfit, ticketMedio, topProductsByProfit }
  }, [products, movements])

  return { 
    products, movements, paymentSettings, entities, channels, categories, isLoaded, isLoading, error,
    addProduct, updateProduct, deleteProduct, addMovement, updateMovement, deleteMovement,
    updatePaymentSettings, uploadImage, getStats, addCategory, deleteCategory, addEntity, deleteEntity, addChannel, deleteChannel
  }
}
