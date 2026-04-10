import { useState, useEffect, useCallback } from 'react'
import { supabase, Product, Movement } from '@/lib/supabase'

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar produtos')
    }
  }, [])

  const fetchMovements = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setMovements(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar movimentações')
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchProducts(), fetchMovements()])
      setIsLoaded(true)
      setIsLoading(false)
    }
    loadData()
  }, [fetchProducts, fetchMovements])

  const addProduct = async (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    await fetchProducts()
    return data
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await fetchProducts()
    return data
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchProducts()
  }

  const addMovement = async (movement: Omit<Movement, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error: moveError } = await supabase
      .from('movements')
      .insert([{ ...movement, user_id: user.id }])
      .select()
      .single()

    if (moveError) throw moveError

    await Promise.all([fetchProducts(), fetchMovements()])
    return data
  }

  // NOVA FUNÇÃO: Atualizar Movimentação
  const updateMovement = async (id: string, updates: Partial<Movement>) => {
    const { data, error } = await supabase
      .from('movements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await Promise.all([fetchProducts(), fetchMovements()])
    return data
  }

  // NOVA FUNÇÃO: Deletar Movimentação
  const deleteMovement = async (id: string) => {
    const { error } = await supabase
      .from('movements')
      .delete()
      .eq('id', id)

    if (error) throw error
    await Promise.all([fetchProducts(), fetchMovements()])
  }

  const getStats = useCallback(async () => {
    const totalProducts = products.length
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
    const lowStock = products.filter(p => p.quantity <= p.min_quantity).length
    
    const inventoryValue = products.reduce((sum, p) => sum + (p.quantity * (p.cost_price || 0)), 0)
    
    const totalRevenue = movements
      .filter(m => m.type === 'saida' && m.movement_reason === 'venda')
      .reduce((sum, m) => sum + (m.quantity * (m.sale_price || 0)), 0)

    const totalProfit = movements
      .filter(m => m.type === 'saida' && m.movement_reason === 'venda')
      .reduce((sum, m) => {
        const product = products.find(p => p.id === m.product_id)
        const cost = product ? product.cost_price || 0 : 0
        const sale = m.sale_price || 0
        return sum + (m.quantity * (sale - cost))
      }, 0)

    return {
      totalProducts,
      totalQuantity,
      lowStock,
      inventoryValue,
      totalRevenue,
      totalProfit
    }
  }, [products, movements])

  return {
    products,
    movements,
    isLoading,
    isLoaded,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    updateMovement,
    deleteMovement,
    getStats,
    fetchProducts,
    fetchMovements
  }
}
