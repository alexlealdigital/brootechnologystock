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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchData = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      
      const [p, m, s, e, c, cat] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', userId).order('name'),
        supabase.from('movements').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('payment_settings').select('*').eq('user_id', userId),
        supabase.from('entities').select('*').eq('user_id', userId).order('name'),
        supabase.from('channels').select('*').eq('user_id', userId).order('name'),
        supabase.from('categories').select('*').eq('user_id', userId).order('name')
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

  // 1. Ouvir mudanças de autenticação para disparar o carregamento
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id || null
      setCurrentUserId(userId)
      
      if (userId) {
        fetchData(userId)
      } else {
        // Resetar dados ao sair
        setProducts([])
        setMovements([])
        setPaymentSettings([])
        setEntities([])
        setChannels([])
        setCategories([])
        setIsLoaded(false)
      }
    })

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setCurrentUserId(session.user.id)
        fetchData(session.user.id)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [fetchData])

  const uploadImage = async (file: File) => {
    try {
      if (!currentUserId) throw new Error('Usuário não autenticado')
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUserId}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
      return publicUrl
    } catch (err) { throw err }
  }

  // --- CRUD FUNCTIONS ---
  const addProduct = async (product: any) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from('products').insert([{ ...product, user_id: currentUserId }])
    if (err) throw err
    await fetchData(currentUserId)
  }

  const updateProduct = async (id: string, updates: any) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from("products").update(updates).eq("id", id).eq("user_id", currentUserId)
    if (err) throw err
    await fetchData(currentUserId)
  }

  const deleteProduct = async (id: string) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from("products").delete().eq("id", id).eq("user_id", currentUserId)
    if (err) throw err
    await fetchData(currentUserId)
  }

  const addCategory = async (name: string) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from('categories').insert([{ name, user_id: currentUserId }])
    if (err) throw err
    await fetchData(currentUserId)
  }

  const deleteCategory = async (id: string) => {
    const { error: err } = await supabase.from('categories').delete().eq('id', id)
    if (err) throw err
    if (currentUserId) await fetchData(currentUserId)
  }

  const addEntity = async (entity: any) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from('entities').insert([{ ...entity, user_id: currentUserId }])
    if (err) throw err
    await fetchData(currentUserId)
  }

  const deleteEntity = async (id: string) => {
    const { error: err } = await supabase.from('entities').delete().eq('id', id)
    if (err) throw err
    if (currentUserId) await fetchData(currentUserId)
  }

  const addChannel = async (channel: any) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from('channels').insert([{ ...channel, user_id: currentUserId }])
    if (err) throw err
    await fetchData(currentUserId)
  }

  const deleteChannel = async (id: string) => {
    const { error: err } = await supabase.from('channels').delete().eq('id', id)
    if (err) throw err
    if (currentUserId) await fetchData(currentUserId)
  }

  const sanitizeMovement = (movement: any) => ({
    ...movement,
    entity_id: movement.entity_id || null,
    channel_id: movement.channel_id || null,
    sale_price: movement.sale_price || null,
    notes: movement.notes || null,
    sale_channel: movement.sale_channel || null,
    payment_method: movement.payment_method || null,
  })

  const addMovement = async (movement: any) => {
    if (!currentUserId) return
    let fee_amount = 0
    if (movement.type === 'saida' && movement.payment_method) {
      const setting = paymentSettings.find(s => s.method_name === movement.payment_method)
      fee_amount = ((movement.sale_price || 0) * movement.quantity * (setting?.fee_percentage || 0)) / 100
    }
    const sanitized = sanitizeMovement(movement)
    const { error: err } = await supabase.from('movements').insert([{ ...sanitized, fee_amount, user_id: currentUserId, date: sanitized.date || new Date().toISOString() }])
    if (err) throw err
    await fetchData(currentUserId)
  }

  const updateMovement = async (id: string, updates: any) => {
    if (!currentUserId) return
    let fee_amount = updates.fee_amount ?? 0
    if (updates.type === 'saida' && updates.payment_method) {
      const setting = paymentSettings.find(s => s.method_name === updates.payment_method)
      fee_amount = ((updates.sale_price || 0) * updates.quantity * (setting?.fee_percentage || 0)) / 100
    }
    const sanitized = sanitizeMovement(updates)
    const { error: err } = await supabase.from('movements').update({ ...sanitized, fee_amount }).eq('id', id).eq('user_id', currentUserId)
    if (err) throw err
    await fetchData(currentUserId)
  }

  const deleteMovement = async (id: string) => {
    if (!currentUserId) return
    const { error: err } = await supabase.from("movements").delete().eq("id", id).eq("user_id", currentUserId)
    if (err) throw err
    await fetchData(currentUserId)
  }

  const updatePaymentSettings = async (settings: any[]) => {
    if (!currentUserId) return
    for (const s of settings) {
      await supabase.from('payment_settings').upsert({ user_id: currentUserId, ...s }, { onConflict: 'user_id,method_name' })
    }
    await fetchData(currentUserId)
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
